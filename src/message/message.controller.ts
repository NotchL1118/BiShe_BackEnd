import { Controller, Get, Query, Req } from '@nestjs/common';
import { MessageService } from './message.service';
import { MyRequest } from 'src/types';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('getChatList')
  async getChatList(@Req() req: MyRequest) {
    const { id: currentUserId } = req.user;
    return await this.messageService.getChatList(currentUserId);
  }

  @Get('getChatMessageList')
  async getChatMessageList(@Req() req: MyRequest, @Query('id') id: number) {
    const { id: currentUserId } = req.user;
    return await this.messageService.getChatMessageList(currentUserId, id);
  }

  // 获取所有种类未读消息数量
  @Get('getAllUnreadMessageCount')
  async getUnreadAllMessageCount(@Req() req: MyRequest) {
    const { id: currentUserId } = req.user;
    return await this.messageService.getAllKindsOfMessageCount(currentUserId);
  }
}
