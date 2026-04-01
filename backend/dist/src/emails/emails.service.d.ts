import { ConfigService } from '@nestjs/config';
export declare class EmailsService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendAccountCreatedEmail(email: string, name: string, tempPassword: string): Promise<void>;
}
