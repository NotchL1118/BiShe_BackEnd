import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { SendPrivateMessageDto } from './dto/ws.dto';
import { ChatMessage } from '../message/entities/chatMessage.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatList } from '../message/entities/chatList.entity';
import { SocketEvents } from 'src/constant';

@Injectable()
export class WsService {
  constructor(private readonly authServer: AuthService) {}

  @InjectRepository(ChatMessage)
  private readonly chatMessageRepository: Repository<ChatMessage>;

  @InjectRepository(ChatList)
  private readonly chatListRepository: Repository<ChatList>;

  server: Server;
  // 保存所有连接的客户端
  connectedClinets: Map<string | number, Socket> = new Map();

  // 客户端连接
  async online(client: Socket, token: string) {
    console.log('online');
    if (!token) {
      client.send('未登录');
      client.disconnect();
      return;
    }
    const userInfo: {
      id: number;
      username: string;
    } = await this.authServer.validateToken(token.replace('Bearer ', ''));
    const userId = userInfo?.id;
    if (!userId) {
      client.send('未登录');
      client.disconnect();
      return;
    }
    console.log(userId, ' connect!');
    this.connectedClinets.set(userId, client);
  }

  // 客户端断开连接
  outline(client: Socket) {
    this.connectedClinets.forEach((value, key) => {
      if (value === client) {
        this.connectedClinets.delete(key);
      }
    });
  }
  // 辅助函数，用于下方的发送私信使用
  async _checkChatList(from_id: number, to_id: number) {
    console.log('from_id', from_id, 'to_id', to_id);
    let senderChatList = await this.chatListRepository.findOne({
      where: {
        from_user: {
          id: from_id,
        },
        to_user: {
          id: to_id,
        },
      },
    });
    if (!senderChatList) {
      senderChatList = this.chatListRepository.create({
        from_user: {
          id: from_id,
        },
        to_user: {
          id: to_id,
        },
        status: true,
      });
    } else if (senderChatList.status) {
      senderChatList.status = true;
    }
    if (from_id === to_id) return [senderChatList, senderChatList];
    let receiverChatList = await this.chatListRepository.findOne({
      where: {
        from_user: {
          id: to_id,
        },
        to_user: {
          id: from_id,
        },
      },
    });
    if (!receiverChatList) {
      receiverChatList = this.chatListRepository.create({
        from_user: {
          id: to_id,
        },
        to_user: {
          id: from_id,
        },
        status: true,
      });
    } else if (receiverChatList.status) {
      receiverChatList.status = true;
    }
    return [senderChatList, receiverChatList];
  }
  // 发送私信
  async sendPrivateMessage(data: SendPrivateMessageDto) {
    const { from_id, to_id, content } = data;
    const toClient = this.connectedClinets.get(to_id);
    // 首先确认是否有聊天列表,没有则创建两个列表记录
    const [senderChatList, receiverChatList] = await this._checkChatList(from_id, to_id);
    const newChatMessage = this.chatMessageRepository.create({
      from_user: {
        id: from_id,
      },
      to_user: {
        id: to_id,
      },
      content,
    });
    // 如果发送者和接收者是同一个人,则不发送消息，直接保存即可
    if (from_id !== to_id) {
      if (toClient) {
        toClient.emit(SocketEvents.PRIVATE_MESSAGE, {
          from_id,
          to_id,
          content,
          createTime: newChatMessage.createTime,
        });
      } else {
        senderChatList.unread = senderChatList.unread || 0;
        senderChatList.unread += 1; // TODO 待定,有Bug就改
      }
    }
    const newM = await this.chatMessageRepository.save(newChatMessage);
    senderChatList.lastMessage = newM;
    receiverChatList.lastMessage = newM;
    await this.chatListRepository.save(senderChatList);
    await this.chatListRepository.save(receiverChatList);
    return newChatMessage;
  }

  // 工具函数，用于向客户端发送请求
  sendMessageToUser<T>(userId: number, emitPath: string, data?: T) {
    const socket = this.connectedClinets.get(userId);
    if (socket) {
      const res = socket.emit(emitPath, data);
      return res;
    }
    return false;
  }

  joinChatRoom(data: { userId: number; roomId: number }) {
    const client = this.connectedClinets.get(data.userId);
    client.join(`room-${data.roomId}`);
  }

  leaveChatRoom(data: { userId: number; roomId: number }) {
    const client = this.connectedClinets.get(data.userId);
    client.leave(`room-${data.roomId}`);
  }

  sendStreamRoomChatMsg(data: {
    user: {
      id: number;
      nickname: string;
    };
    roomId: number;
    content: string;
  }) {
    // this.server.to(`room-${data.roomId}`).emit('streamRoomChatMsg', data);
    const client = this.connectedClinets.get(data.user.id);
    client.broadcast.to(`room-${data.roomId}`).emit('receiveStreamRoomChatMsg', data);
  }

  // 重置所有客户端
  resetAllClinets() {
    this.connectedClinets.clear();
  }
}
