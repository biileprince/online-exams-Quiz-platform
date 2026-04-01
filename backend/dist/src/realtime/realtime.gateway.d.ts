import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { RealtimeService } from './realtime.service';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly realtimeService;
    private jwtService;
    server: Server;
    private readonly logger;
    constructor(realtimeService: RealtimeService, jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinExam(data: {
        examId: string;
    }, client: Socket): Promise<{
        error: string;
        status?: undefined;
        examId?: undefined;
    } | {
        status: string;
        examId: string;
        error?: undefined;
    }>;
    handleSaveAnswer(data: {
        examId: string;
        questionId: string;
        answer: any;
    }, client: Socket): Promise<{
        error: string;
        status?: undefined;
        questionId?: undefined;
        message?: undefined;
    } | {
        status: string;
        questionId: string;
        error?: undefined;
        message?: undefined;
    } | {
        status: string;
        message: any;
        error?: undefined;
        questionId?: undefined;
    }>;
    handleHeartbeat(data: {
        examId: string;
        focus: boolean;
    }, client: Socket): Promise<{
        status: string;
    }>;
}
