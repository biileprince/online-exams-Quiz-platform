import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/question.dto';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const exam = await this.prisma.exam.findUnique({ where: { id: createQuestionDto.examId } });
    if (!exam) throw new NotFoundException(`Exam not found`);

    return this.prisma.question.create({
      data: createQuestionDto as any 
    });
  }

  async findAllByExam(examId: string) {
    return this.prisma.question.findMany({
      where: { examId },
      orderBy: { id: 'asc' } 
    });
  }

  async remove(id: string) {
    return this.prisma.question.delete({
      where: { id }
    });
  }
}
