import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/question.dto';
export declare class QuestionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createQuestionDto: CreateQuestionDto): Promise<{
        id: string;
        examId: string;
        type: import("@prisma/client").$Enums.QuestionType;
        content: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        correctAnswer: import("@prisma/client/runtime/client").JsonValue;
        marks: number;
    }>;
    findAllByExam(examId: string): Promise<{
        id: string;
        examId: string;
        type: import("@prisma/client").$Enums.QuestionType;
        content: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        correctAnswer: import("@prisma/client/runtime/client").JsonValue;
        marks: number;
    }[]>;
    remove(id: string): Promise<{
        id: string;
        examId: string;
        type: import("@prisma/client").$Enums.QuestionType;
        content: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        correctAnswer: import("@prisma/client/runtime/client").JsonValue;
        marks: number;
    }>;
}
