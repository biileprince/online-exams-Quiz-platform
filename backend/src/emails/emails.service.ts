import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendAccountCreatedEmail(email: string, name: string, tempPassword: string) {
    const msg = {
      to: email,
      from: this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@online-exam.com',
      subject: 'Your Online Exam Account Details',
      text: `Hello ${name},\n\nYour account has been created. Your temporary password is: ${tempPassword}\n\nPlease log in to access your exam.`,
      html: `<strong>Hello ${name},</strong><br><br>Your account has been created. Your temporary password is: <strong>${tempPassword}</strong><br><br>Please log in to access your exam.`,
    };

    try {
      if (this.configService.get<string>('SENDGRID_API_KEY')) {
        await sgMail.send(msg);
        this.logger.log(`Account creation email sent to ${email}`);
      } else {
        this.logger.log(`[DRY RUN] Email to ${email} with password: ${tempPassword}`);
      }
    } catch (error) {
      this.logger.error(`Error sending email to ${email}`, error.response?.body || error.message);
    }
  }
}
