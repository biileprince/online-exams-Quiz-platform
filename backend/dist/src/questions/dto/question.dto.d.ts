import { QuestionType } from '@prisma/client';
export declare class CreateQuestionDto {
    examId: string;
    type: QuestionType;
    content: string;
    metadata: any;
    correctAnswer: any;
    marks: number;
}
