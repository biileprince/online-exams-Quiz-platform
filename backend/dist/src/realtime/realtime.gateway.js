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
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const realtime_service_1 = require("./realtime.service");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    realtimeService;
    jwtService;
    server;
    logger = new common_1.Logger(RealtimeGateway_1.name);
    constructor(realtimeService, jwtService) {
        this.realtimeService = realtimeService;
        this.jwtService = jwtService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
            if (!token)
                throw new Error('No token provided');
            const payload = this.jwtService.decode(token);
            if (!payload)
                throw new Error('Invalid token');
            client.data.user = payload;
            this.logger.log(`Client connected: ${client.id}`);
        }
        catch (e) {
            this.logger.warn(`Unauthorized socket connection disconnected: ${client.id}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.realtimeService.handleUserDisconnect(client.id);
    }
    async handleJoinExam(data, client) {
        const userId = client.data.user?.sub;
        if (!userId)
            return { error: 'Unauthorized' };
        client.join(`exam_${data.examId}`);
        await this.realtimeService.registerStudentActive(data.examId, userId, client.id);
        client.to(`exam_${data.examId}`).emit('student_online', { userId });
        return { status: 'joined_exam', examId: data.examId };
    }
    async handleSaveAnswer(data, client) {
        const userId = client.data.user?.sub;
        if (!userId)
            return { error: 'Unauthorized' };
        try {
            await this.realtimeService.saveSubmission(userId, data.examId, data.questionId, data.answer);
            return { status: 'saved', questionId: data.questionId };
        }
        catch (error) {
            return { status: 'error', message: error.message };
        }
    }
    async handleHeartbeat(data, client) {
        if (!data.focus) {
            this.logger.warn(`User ${client.data.user?.sub} lost focus on Exam ${data.examId}`);
        }
        return { status: 'ack' };
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_exam'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleJoinExam", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('save_answer'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleSaveAnswer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('heartbeat'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleHeartbeat", null);
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
    }),
    __metadata("design:paramtypes", [realtime_service_1.RealtimeService,
        jwt_1.JwtService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map