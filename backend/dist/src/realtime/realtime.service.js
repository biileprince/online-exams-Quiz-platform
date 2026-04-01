"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RealtimeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ioredis_1 = require("@nestjs-modules/ioredis");
const ioredis_2 = __importDefault(require("ioredis"));
let RealtimeService = RealtimeService_1 = class RealtimeService {
    prisma;
    redis;
    logger = new common_1.Logger(RealtimeService_1.name);
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async registerStudentActive(examId, userId, clientId) {
        await this.redis.set(`client:${clientId}`, JSON.stringify({ examId, userId }), 'EX', 14400);
        this.logger.log(`User ${userId} active in exam ${examId} (Socket: ${clientId})`);
    }
    async handleUserDisconnect(clientId) {
        const raw = await this.redis.get(`client:${clientId}`);
        if (raw) {
            const { examId, userId } = JSON.parse(raw);
            this.logger.log(`User ${userId} disconnected from exam ${examId}`);
            await this.redis.del(`client:${clientId}`);
        }
    }
    async setServerTimer(participantId, durationMin) {
        const expiresAt = Date.now() + durationMin * 60000;
        await this.redis.set(`timer:${participantId}`, expiresAt.toString(), 'EX', durationMin * 60);
        return expiresAt;
    }
    async getRemainingTime(participantId) {
        const expireStr = await this.redis.get(`timer:${participantId}`);
        if (!expireStr)
            return 0;
        const remaining = parseInt(expireStr) - Date.now();
        return remaining > 0 ? remaining : 0;
    }
    async saveSubmission(userId, examId, questionId, givenAnswer) {
        let participant = await this.prisma.examParticipant.findUnique({
            where: { examId_userId: { examId, userId } }
        });
        if (!participant) {
            participant = await this.prisma.examParticipant.create({
                data: { examId, userId, status: 'IN_PROGRESS', startedAt: new Date() }
            });
        }
        if (participant.status === 'COMPLETED') {
            throw new Error('Exam is officially completed, answers cannot be submitted');
        }
        return await this.prisma.submission.upsert({
            where: {
                participantId_questionId: {
                    participantId: participant.id,
                    questionId,
                }
            },
            update: { givenAnswer, isCorrect: false, scoreEarned: 0.0 },
            create: {
                participantId: participant.id,
                questionId,
                givenAnswer,
            }
        });
    }
};
exports.RealtimeService = RealtimeService;
exports.RealtimeService = RealtimeService = RealtimeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, ioredis_1.InjectRedis)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ioredis_2.default])
], RealtimeService);
//# sourceMappingURL=realtime.service.js.map