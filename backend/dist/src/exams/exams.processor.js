"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UploadProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const xlsx = __importStar(require("xlsx"));
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const emails_service_1 = require("../emails/emails.service");
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const common_1 = require("@nestjs/common");
let UploadProcessor = UploadProcessor_1 = class UploadProcessor extends bullmq_1.WorkerHost {
    prisma;
    emailsService;
    logger = new common_1.Logger(UploadProcessor_1.name);
    constructor(prisma, emailsService) {
        super();
        this.prisma = prisma;
        this.emailsService = emailsService;
    }
    async process(job) {
        const { examId, filePath } = job.data;
        this.logger.log(`Processing Excel file ${filePath} for exam ${examId}`);
        try {
            const file = xlsx.readFile(filePath);
            const sheet = file.Sheets[file.SheetNames[0]];
            const data = xlsx.utils.sheet_to_json(sheet);
            let addedCount = 0;
            for (const row of data) {
                let name = row.Name || row.name;
                let email = row.Email || row.email;
                let indexNumber = row.IndexNumber || row.indexNumber || row.index_number;
                let course = row.Course || row.course;
                if (!email)
                    continue;
                email = email.toLowerCase().trim();
                await this.prisma.$transaction(async (tx) => {
                    let user = await tx.user.findUnique({ where: { email } });
                    let tempPassword = null;
                    if (!user) {
                        tempPassword = (0, uuid_1.v4)().slice(0, 8);
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
        }
        catch (error) {
            this.logger.error(`Error processing job ${job.id}`, error.stack);
            throw error;
        }
        finally {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }
};
exports.UploadProcessor = UploadProcessor;
exports.UploadProcessor = UploadProcessor = UploadProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('upload_students_queue'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        emails_service_1.EmailsService])
], UploadProcessor);
//# sourceMappingURL=exams.processor.js.map