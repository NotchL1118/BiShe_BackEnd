import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserNoteLike } from 'src/note/entities/like.entity';
import { UserFollow } from './entities/follow.entity';
import { BlackList } from './entities/black.entity';
import { WsModule } from 'src/ws/ws.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserNoteLike, UserFollow, BlackList]), WsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
