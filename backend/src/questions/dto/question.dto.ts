import { IsString, IsNotEmpty, IsEnum, IsNumber, IsObject } from 'class-validator';
import { QuestionType } from '@prisma/client';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  examId: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsObject()
  metadata: any; 

  @IsObject()
  correctAnswer: any; 

  @IsNumber()
  marks: number;
}
