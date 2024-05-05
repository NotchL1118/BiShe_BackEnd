import {
  WebSocketGateway,
  SubscribeMessage,
  // MessageBody,
  OnGatewayConnection,
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  // ConnectedSocket,
} from '@nestjs/websockets';
import { WsService } from './ws.service';
import { Server, Socket } from 'socket.io';
import { SendPrivateMessageDto } from './dto/ws.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  constructor(private readonly wsService: WsService) {}

  async handleConnection(client: Socket) {
    const token = client.handshake?.auth?.token ?? client.handshake.headers.authorization;
    return await this.wsService.online(client, token);
  }

  handleDisconnect(client: Socket) {
    return this.wsService.outline(client);
  }

  afterInit(server: Server) {
    this.wsService.server = server;
    this.wsService.resetAllClinets();
  }

  @SubscribeMessage('sendPrivateMessage')
  async handleSendPrivateMessage(@MessageBody() data: SendPrivateMessageDto) {
    return await this.wsService.sendPrivateMessage(data);
  }

  @SubscribeMessage('joinChatRoom')
  handleJoinChatRoom(@MessageBody() data: { userId: string; roomId: number }) {
    return this.wsService.joinChatRoom({
      userId: parseInt(data.userId),
      roomId: data.roomId,
    });
  }

  @SubscribeMessage('leaveChatRoom')
  handleLeaveChatRoom(@MessageBody() data: { userId: string; roomId: number }) {
    return this.wsService.leaveChatRoom({
      userId: parseInt(data.userId),
      roomId: data.roomId,
    });
  }

  @SubscribeMessage('sendStreamRoomChatMsg')
  handleSendStreamRoomChatMsg(
    @MessageBody()
    data: {
      user: {
        id: number;
        nickname: string;
      };
      roomId: number;
      content: string;
    },
  ) {
    return this.wsService.sendStreamRoomChatMsg(data);
  }
}
