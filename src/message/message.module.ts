import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatList } from './entities/chatList.entity';
import { ChatMessage } from './entities/chatMessage.entity';
import { User } from 'src/user/entities/user.entity';
import { NoteComment } from 'src/comment/entities/comment.entity';
import { UserNoteCollect } from 'src/note/entities/collect.entity';
import { UserNoteLike } from 'src/note/entities/like.entity';
import { UserFollow } from 'src/user/entities/follow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatList, ChatMessage, User, NoteComment, UserNoteCollect, UserNoteLike, UserFollow]),
  ],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
