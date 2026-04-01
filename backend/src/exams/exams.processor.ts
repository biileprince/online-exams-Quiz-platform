import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as xlsx from 'xlsx';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailsService } from '../emails/emails.service';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { Logger } from '@nestjs/common';

@Processor('upload_students_queue')
export class UploadProcessor extends WorkerHost {
  private readonly logger = new Logger(UploadProcessor.name);

  constructor(
    private prisma: PrismaService,
    private emailsService: EmailsService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { examId, filePath } = job.data;
    
    this.logger.log(`Processing Excel file ${filePath} for exam ${examId}`);

    try {
      const file = xlsx.readFile(filePath);
      const sheet = file.Sheets[file.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet) as any[];

      let addedCount = 0;

      for (const row of data) {
        let name = row.Name || row.name;
        let email = row.Email || row.email;
        let indexNumber = row.IndexNumber || row.indexNumber || row.index_number;
        let course = row.Course || row.course;

        if (!email) continue;
        email = email.toLowerCase().trim();

        await this.prisma.$transaction(async (tx) => {
          let user = await tx.user.findUnique({ where: { email } });
          let tempPassword = null;

          if (!user) {
             tempPassword = uuidv4().slice(0, 8); 
             const passwordHash = await bcrypt.hash(tempPassword, 10);
             user = await tx.user.create({
               data: {
                 name: name || 'Student',
                 email,
                 passwordHash,
                 role: 'STUDENT',
                 indexNumber: indexNumber ? String(indexNumber) : null,
                 course: course ? String(course) : null,
               }
             });
          }

          // Assign to Exam Participant
          await tx.examParticipant.upsert({
            where: { examId_userId: { examId, userId: user.id } },
            update: {}, 
            create: {
              examId,
              userId: user.id,
              status: 'ASSIGNED',
            }
          });

          if (tempPassword) {
            this.emailsService.sendAccountCreatedEmail(email, user.name, tempPassword);
          }
        });

        addedCount++;
      }

      this.logger.log(`Successfully processed ${addedCount} students for exam ${examId}`);
    } catch (error) {
      this.logger.error(`Error processing job ${job.id}`, error.stack);
      throw error;
    } finally {
      if (fs.existsSync(filePath)) {
         fs.unlinkSync(filePath);
      }
    }
  }
}
