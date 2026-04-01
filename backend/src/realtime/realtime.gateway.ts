import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { RealtimeService } from './realtime.service';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly realtimeService: RealtimeService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) throw new Error('No token provided');

      const payload = this.jwtService.decode(token) as any;
      if (!payload) throw new Error('Invalid token');

      client.data.user = payload; 
      this.logger.log(`Client connected: ${client.id}`);
    } catch (e) {
      this.logger.warn(`Unauthorized socket connection disconnected: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.realtimeService.handleUserDisconnect(client.id);
  }

  @SubscribeMessage('join_exam')
  async handleJoinExam(@MessageBody() data: { examId: string }, @ConnectedSocket() client: Socket) {
    const userId = client.data.user?.sub;
    if (!userId) return { error: 'Unauthorized' };

    client.join(`exam_${data.examId}`);
    await this.realtimeService.registerStudentActive(data.examId, userId, client.id);
    
    // Broadcast newly joined user to the room 
    client.to(`exam_${data.examId}`).emit('student_online', { userId });

    return { status: 'joined_exam', examId: data.examId };
  }

  @SubscribeMessage('save_answer')
  async handleSaveAnswer(
    @MessageBody() data: { examId: string, questionId: string, answer: any }, 
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data.user?.sub;
    if (!userId) return { error: 'Unauthorized' };

    try {
      await this.realtimeService.saveSubmission(userId, data.examId, data.questionId, data.answer);
      return { status: 'saved', questionId: data.questionId };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(@MessageBody() data: { examId: string, focus: boolean }, @ConnectedSocket() client: Socket) {
     // A ping informing the server if the user tab is strictly in-focus.
     if (!data.focus) {
       this.logger.warn(`User ${client.data.user?.sub} lost focus on Exam ${data.examId}`);
       // Trigger anti-cheating alert metric via redis or db
     }
    return { status: 'ack' };
  }
}
