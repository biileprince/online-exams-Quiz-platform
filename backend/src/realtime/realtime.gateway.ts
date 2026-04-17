import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { RealtimeService } from './realtime.service';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

interface GatewayUser {
  sub: string;
  role?: string;
}

interface SaveAnswerPayload {
  examId: string;
  questionId: string;
  answer: unknown;
}

@WebSocketGateway({
  cors: { origin: '*' },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly realtimeService: RealtimeService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) throw new Error('No token provided');

      const payload = this.jwtService.verify(token) as GatewayUser;
      if (!payload) throw new Error('Invalid token');

      client.data.user = payload;
      this.logger.log(`Client connected: ${client.id}`);
    } catch {
      this.logger.warn(
        `Unauthorized socket connection disconnected: ${client.id}`,
      );
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const disconnected = await this.realtimeService.handleUserDisconnect(
      client.id,
    );
    if (disconnected) {
      this.server
        .to(`exam_${disconnected.examId}`)
        .emit('student_offline', { userId: disconnected.userId });
    }
  }

  @SubscribeMessage('watch_exam')
  handleWatchExam(
    @MessageBody() data: { examId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = (client.data.user as GatewayUser | undefined)?.sub;
    if (!userId) return { error: 'Unauthorized' };

    client.join(`exam_${data.examId}`);
    return { status: 'watching_exam', examId: data.examId };
  }

  @SubscribeMessage('join_exam')
  async handleJoinExam(
    @MessageBody() data: { examId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = (client.data.user as GatewayUser | undefined)?.sub;
    if (!userId) return { error: 'Unauthorized' };

    client.join(`exam_${data.examId}`);
    await this.realtimeService.registerStudentActive(
      data.examId,
      userId,
      client.id,
    );
    const remainingSeconds = await this.realtimeService.ensureParticipantTimer(
      data.examId,
      userId,
    );

    // Broadcast newly joined user to the room
    client.to(`exam_${data.examId}`).emit('student_online', { userId });

    client.emit('timer_sync', { examId: data.examId, remainingSeconds });

    return { status: 'joined_exam', examId: data.examId, remainingSeconds };
  }

  @SubscribeMessage('save_answer')
  async handleSaveAnswer(
    @MessageBody() data: SaveAnswerPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = (client.data.user as GatewayUser | undefined)?.sub;
    if (!userId) return { error: 'Unauthorized' };

    try {
      await this.realtimeService.saveSubmission(
        userId,
        data.examId,
        data.questionId,
        data.answer,
      );
      return { status: 'saved', questionId: data.questionId };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to save answer';
      return { status: 'error', message };
    }
  }

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(
    @MessageBody() data: { examId: string; focus: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    // A ping informing the server if the user tab is strictly in-focus.
    const userId = (client.data.user as GatewayUser | undefined)?.sub;
    if (!data.focus) {
      this.logger.warn(`User ${userId} lost focus on Exam ${data.examId}`);
      client.to(`exam_${data.examId}`).emit('focus_alert', {
        examId: data.examId,
        userId,
        focus: false,
        at: new Date().toISOString(),
      });
      // Trigger anti-cheating alert metric via redis or db
    }
    return { status: 'ack' };
  }
}
