import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Roles('ADMIN', 'LECTURER')
  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(createQuestionDto);
  }

  @Roles('ADMIN', 'LECTURER', 'STUDENT')
  @Get('exam/:examId')
  findAllByExam(@Param('examId') examId: string) {
    return this.questionsService.findAllByExam(examId);
  }

  @Roles('ADMIN', 'LECTURER')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}
