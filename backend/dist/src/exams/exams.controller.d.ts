import { ExamsService } from './exams.service';
import { CreateExamDto, UpdateExamDto } from './dto/exam.dto';
export declare const storage: import("multer").StorageEngine;
export declare class ExamsController {
    private readonly examsService;
    constructor(examsService: ExamsService);
    create(createExamDto: CreateExamDto, user: any): Promise<{
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
    update(id: string, updateExamDto: UpdateExamDto, user: any): Promise<{
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
    remove(id: string, user: any): Promise<{
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
    uploadStudents(examId: string, file: Express.Multer.File): Promise<{
        message: string;
        file: string;
        status: string;
    }>;
}
