import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExamsService {
  constructor(
    @InjectQueue('upload_students_queue') private uploadQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async queueStudentsUpload(examId: string, filePath: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${examId} not found`);
    }

    await this.uploadQueue.add('process_excel', {
      examId,
      filePath,
    });
  }
}
