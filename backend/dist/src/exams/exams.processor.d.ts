import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EmailsService } from '../emails/emails.service';
export declare class UploadProcessor extends WorkerHost {
    private prisma;
    private emailsService;
    private readonly logger;
    constructor(prisma: PrismaService, emailsService: EmailsService);
    process(job: Job<any, any, string>): Promise<any>;
}
