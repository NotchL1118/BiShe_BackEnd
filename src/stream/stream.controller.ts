import { Body, Controller, Get, Req, Post, Query } from '@nestjs/common';
import { StreamService } from './stream.service';
import { AddStreamRoomDto } from './dto/stream.dto';
import { MyRequest } from 'src/types';

@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Get('/getOnlineStreamList')
  async getOnlineStreamList() {
    return await this.streamService.getOnlineStream();
  }

  @Post('/updateStreamRoom')
  async updateStreamRoom(@Body() dto: AddStreamRoomDto, @Req() req: MyRequest) {
    const { id } = req.user;
    return await this.streamService.createOrUpdateStreamRoom(id, dto);
  }

  @Get('/getOwnRoomInfo')
  async getOwnRoomInfo(@Req() req: MyRequest) {
    const { id } = req.user;
    return await this.streamService.getOwnRoomInfo(id);
  }

  @Get('/getRoomInfo')
  async getRoomInfo(@Query('id') id: number) {
    return await this.streamService.getRoomInfo(id);
  }
}
