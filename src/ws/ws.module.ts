import { Module } from '@nestjs/common';
import { WsService } from './ws.service';
import { WsGateway } from './ws.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatList } from '../message/entities/chatList.entity';
import { ChatMessage } from '../message/entities/chatMessage.entity';

@Module({
  providers: [WsGateway, WsService],
  exports: [WsService],
  imports: [AuthModule, TypeOrmModule.forFeature([ChatList, ChatMessage])],
})
export class WsModule {}
