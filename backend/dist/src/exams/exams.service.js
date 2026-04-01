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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
let ExamsService = class ExamsService {
    uploadQueue;
    prisma;
    constructor(uploadQueue, prisma) {
        this.uploadQueue = uploadQueue;
        this.prisma = prisma;
    }
    async queueStudentsUpload(examId, filePath) {
        const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
        if (!exam)
            throw new common_1.NotFoundException(`Exam with ID ${examId} not found`);
        await this.uploadQueue.add('process_excel', { examId, filePath });
    }
    async create(createExamDto, creatorId) {
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
    async findOne(id) {
        const exam = await this.prisma.exam.findUnique({
            where: { id },
            include: {
                questions: true,
            }
        });
        if (!exam)
            throw new common_1.NotFoundException(`Exam ${id} not found`);
        return exam;
    }
    async update(id, updateExamDto, userId, role) {
        const exam = await this.findOne(id);
        if (exam.creatorId !== userId && role !== 'ADMIN') {
            throw new common_1.UnauthorizedException('You do not have permission to modify this exam');
        }
        const data = { ...updateExamDto };
        if (data.startTime)
            data.startTime = new Date(data.startTime);
        if (data.endTime)
            data.endTime = new Date(data.endTime);
        return this.prisma.exam.update({
            where: { id },
            data,
        });
    }
    async remove(id, userId, role) {
        const exam = await this.findOne(id);
        if (exam.creatorId !== userId && role !== 'ADMIN') {
            throw new common_1.UnauthorizedException('You do not have permission to delete this exam');
        }
        return this.prisma.exam.delete({
            where: { id },
        });
    }
};
exports.ExamsService = ExamsService;
exports.ExamsService = ExamsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('upload_students_queue')),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        prisma_service_1.PrismaService])
], ExamsService);
//# sourceMappingURL=exams.service.js.map