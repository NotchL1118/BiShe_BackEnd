import { Module, forwardRef } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { User } from 'src/user/entities/user.entity';
import { NoteTags } from './entities/tags.entity';
import { NoteSections } from './entities/secetions.entity';
import { UserNoteLike } from './entities/like.entity';
import { UserNoteCollect } from './entities/collect.entity';
import { UserFollow } from 'src/user/entities/follow.entity';
import { NoteComment } from 'src/comment/entities/comment.entity';
import { WsModule } from 'src/ws/ws.module';
import { SearchModule } from 'src/search/search.module';

@Module({
  controllers: [NoteController],
  imports: [
    TypeOrmModule.forFeature([
      Note,
      User,
      NoteTags,
      NoteSections,
      UserNoteLike,
      UserNoteCollect,
      UserFollow,
      NoteComment,
    ]),
    WsModule,
    forwardRef(() => SearchModule),
  ],
  providers: [NoteService],
  exports: [NoteService],
})
export class NoteModule {}
