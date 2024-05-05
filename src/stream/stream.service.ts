import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as NodeMediaServer from 'node-media-server';
import { StreamEntity } from './entities/stream.entity';
import { Repository } from 'typeorm';
import { AddStreamRoomDto } from './dto/stream.dto';

@Injectable()
export class StreamService {
  @InjectRepository(StreamEntity)
  private readonly streamRepository: Repository<StreamEntity>;

  private nms: NodeMediaServer;
  createStream() {
    const config = {
      rtmp: {
        port: 1935, // 推流端口
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
      },
      http: {
        port: 8887, // 获取流的地址
        allow_origin: '*',
      },
    };
    this.nms = new NodeMediaServer(config);
    this.nms.run();
    this.nms.on('prePublish', async (_id: string, StreamPath: string) => {
      const userId = StreamPath.split('/')[2];
      const room = await this.streamRepository.findOne({
        where: {
          creater: {
            id: parseInt(userId),
          },
        },
      });
      if (room) {
        room.isLive = true;
        await this.streamRepository.save(room);
      } else {
        await this.createOrUpdateStreamRoom(
          parseInt(userId),
          {
            roomName: '未命名直播间',
            roomCover: '',
          },
          true,
        );
      }
    });
    this.nms.on('donePublish', async (_id: string, StreamPath: string) => {
      const userId = StreamPath.split('/')[2];
      const room = await this.streamRepository.findOne({
        where: {
          creater: {
            id: parseInt(userId),
          },
        },
      });
      if (room) {
        room.isLive = false;
        await this.streamRepository.save(room);
      }
    });
  }

  async createOrUpdateStreamRoom(userId: number, roomDto: AddStreamRoomDto, isLive: boolean = false) {
    const room = await this.streamRepository.findOne({
      where: {
        creater: {
          id: userId,
        },
      },
    });
    if (room) {
      // 更新
      room.roomName = roomDto.roomName;
      room.roomCover = roomDto.roomCover;
      await this.streamRepository.save(room);
    } else {
      // 创建,如果是从上面那个逻辑过来，一定是创建
      const newRoom = this.streamRepository.create({
        roomName: roomDto.roomName,
        roomCover: roomDto.roomCover,
        isLive,
        roomUrl: `http://localhost:8887/live/${userId}`,
        creater: {
          id: userId,
        },
      });
      await this.streamRepository.save(newRoom);
    }
    return '创建/更新成功';
  }
  async getOnlineStream() {
    const res = await this.streamRepository.find({
      where: {
        isLive: true,
      },
    });
    return res.map((item) => {
      return {
        id: item.id,
        roomName: item.roomName,
        roomCover: item.roomCover,
      };
    });
  }

  // 获得自己直播间的信息
  async getOwnRoomInfo(userId: number) {
    const res = await this.streamRepository.findOne({
      where: {
        creater: {
          id: userId,
        },
      },
    });
    if (res) {
      return {
        id: res.id,
        roomName: res.roomName,
        roomCover: res.roomCover,
      };
    } else {
      return {
        id: -1,
        roomName: '',
        roomCover: '',
      };
    }
  }

  // 获取房间信息
  async getRoomInfo(roomId: number) {
    if (!roomId) return;
    const res = await this.streamRepository.findOne({
      where: {
        id: roomId,
      },
      relations: ['creater'],
    });
    if (res) {
      return {
        roomName: res.roomName,
        liveUrl: res.roomUrl,
        isLive: res.isLive,
        creater: {
          id: res.creater.id,
          nickname: res.creater.nickname,
        },
      };
    } else {
      throw new HttpException('房间不存在', 404);
    }
  }
}
