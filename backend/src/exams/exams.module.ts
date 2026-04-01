import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { BullModule } from '@nestjs/bullmq';
import { UploadProcessor } from './exams.processor';
import { EmailsModule } from '../emails/emails.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'upload_students_queue',
    }),
    EmailsModule,
    UsersModule, 
  ],
  providers: [ExamsService, UploadProcessor],
  controllers: [ExamsController],
})
export class ExamsModule {}
