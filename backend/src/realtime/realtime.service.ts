import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  constructor(
    private prisma: PrismaService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async registerStudentActive(examId: string, userId: string, clientId: string) {
    await this.redis.set(`client:${clientId}`, JSON.stringify({ examId, userId }), 'EX', 14400); // 4 hour expiry
    this.logger.log(`User ${userId} active in exam ${examId} (Socket: ${clientId})`);
  }

  async handleUserDisconnect(clientId: string) {
    const raw = await this.redis.get(`client:${clientId}`);
    if (raw) {
      const { examId, userId } = JSON.parse(raw);
      this.logger.log(`User ${userId} disconnected from exam ${examId}`);
      await this.redis.del(`client:${clientId}`);
    }
  }

  async setServerTimer(participantId: string, durationMin: number) {
    const expiresAt = Date.now() + durationMin * 60000;
    await this.redis.set(`timer:${participantId}`, expiresAt.toString(), 'EX', durationMin * 60);
    return expiresAt;
  }

  async getRemainingTime(participantId: string): Promise<number> {
    const expireStr = await this.redis.get(`timer:${participantId}`);
    if (!expireStr) return 0;
    
    const remaining = parseInt(expireStr) - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  async saveSubmission(userId: string, examId: string, questionId: string, givenAnswer: any) {
    let participant = await this.prisma.examParticipant.findUnique({
      where: { examId_userId: { examId, userId } }
    });
    
    if (!participant) {
      participant = await this.prisma.examParticipant.create({
         data: { examId, userId, status: 'IN_PROGRESS', startedAt: new Date() }
      });
    }

    if (participant.status === 'COMPLETED') {
      throw new Error('Exam is officially completed, answers cannot be submitted');
    }

    return await this.prisma.submission.upsert({
      where: {
        participantId_questionId: {
          participantId: participant.id,
          questionId,
        }
      },
      update: { givenAnswer, isCorrect: false, scoreEarned: 0.0 }, 
      create: {
        participantId: participant.id,
        questionId,
        givenAnswer,
      }
    });
  }
}
