import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/question.dto';
export declare class QuestionsController {
    private readonly questionsService;
    constructor(questionsService: QuestionsService);
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
