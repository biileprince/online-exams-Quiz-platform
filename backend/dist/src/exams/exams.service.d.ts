import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto, UpdateExamDto } from './dto/exam.dto';
export declare class ExamsService {
    private uploadQueue;
    private prisma;
    constructor(uploadQueue: Queue, prisma: PrismaService);
    queueStudentsUpload(examId: string, filePath: string): Promise<void>;
    create(createExamDto: CreateExamDto, creatorId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        durationMin: number;
        startTime: Date;
        endTime: Date;
        password: string | null;
        creatorId: string;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        durationMin: number;
        startTime: Date;
        endTime: Date;
        creator: {
            name: string;
            email: string;
        };
    }[]>;
    findOne(id: string): Promise<{
        questions: {
            id: string;
            examId: string;
            type: import("@prisma/client").$Enums.QuestionType;
            content: string;
            metadata: import("@prisma/client/runtime/client").JsonValue;
            correctAnswer: import("@prisma/client/runtime/client").JsonValue;
            marks: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        durationMin: number;
        startTime: Date;
        endTime: Date;
        password: string | null;
        creatorId: string;
    }>;
    update(id: string, updateExamDto: UpdateExamDto, userId: string, role: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        durationMin: number;
        startTime: Date;
        endTime: Date;
        password: string | null;
        creatorId: string;
    }>;
    remove(id: string, userId: string, role: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        durationMin: number;
        startTime: Date;
        endTime: Date;
        password: string | null;
        creatorId: string;
    }>;
}
