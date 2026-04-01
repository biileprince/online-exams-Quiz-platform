import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto, UpdateExamDto } from './dto/exam.dto';

@Injectable()
export class ExamsService {
  constructor(
    @InjectQueue('upload_students_queue') private uploadQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async queueStudentsUpload(examId: string, filePath: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException(`Exam with ID ${examId} not found`);

    await this.uploadQueue.add('process_excel', { examId, filePath });
  }

  async create(createExamDto: CreateExamDto, creatorId: string) {
    return this.prisma.exam.create({
      data: {
        ...createExamDto,
        startTime: new Date(createExamDto.startTime),
        endTime: new Date(createExamDto.endTime),
        creatorId,
      },
    });
  }

  async findAll() {
    return this.prisma.exam.findMany({
      select: {
        id: true,
        title: true,
        durationMin: true,
        startTime: true,
        endTime: true,
        createdAt: true,
        creator: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        questions: true,
      }
    });

    if (!exam) throw new NotFoundException(`Exam ${id} not found`);
    return exam;
  }

  async update(id: string, updateExamDto: UpdateExamDto, userId: string, role: string) {
    const exam = await this.findOne(id);
    
    if (exam.creatorId !== userId && role !== 'ADMIN') {
      throw new UnauthorizedException('You do not have permission to modify this exam');
    }

    const data: any = { ...updateExamDto };
    if (data.startTime) data.startTime = new Date(data.startTime);
    if (data.endTime) data.endTime = new Date(data.endTime);

    return this.prisma.exam.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string, role: string) {
    const exam = await this.findOne(id);
    
    if (exam.creatorId !== userId && role !== 'ADMIN') {
      throw new UnauthorizedException('You do not have permission to delete this exam');
    }

    return this.prisma.exam.delete({
      where: { id },
    });
  }
}
