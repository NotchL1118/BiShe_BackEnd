import { IsNotEmpty } from 'class-validator';

export class AddStreamRoomDto {
  @IsNotEmpty({
    message: '标题不能为空',
  })
  roomName: string;
  roomCover: string;
}
