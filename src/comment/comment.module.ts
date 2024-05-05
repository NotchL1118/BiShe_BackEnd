import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteComment } from './entities/comment.entity';
import { User } from 'src/user/entities/user.entity';
import { Note } from 'src/note/entities/note.entity';
import { WsModule } from 'src/ws/ws.module';

@Module({
  controllers: [CommentController],
  imports: [TypeOrmModule.forFeature([NoteComment, User, Note]), WsModule],
  providers: [CommentService],
})
export class CommentModule {}
