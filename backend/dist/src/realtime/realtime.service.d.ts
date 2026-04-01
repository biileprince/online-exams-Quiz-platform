import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';
export declare class RealtimeService {
    private prisma;
    private readonly redis;
    private readonly logger;
    constructor(prisma: PrismaService, redis: Redis);
    registerStudentActive(examId: string, userId: string, clientId: string): Promise<void>;
    handleUserDisconnect(clientId: string): Promise<void>;
    setServerTimer(participantId: string, durationMin: number): Promise<number>;
    getRemainingTime(participantId: string): Promise<number>;
    saveSubmission(userId: string, examId: string, questionId: string, givenAnswer: any): Promise<{
        id: string;
        participantId: string;
        questionId: string;
        givenAnswer: import("@prisma/client/runtime/client").JsonValue;
        isCorrect: boolean;
        scoreEarned: number;
    }>;
}
