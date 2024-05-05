import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { NoteModule } from './note/note.module';
import { Note } from './note/entities/note.entity';
import { NoteTags } from './note/entities/tags.entity';
import { NoteSections } from './note/entities/secetions.entity';
import { UserNoteLike } from './note/entities/like.entity';
import { UserNoteCollect } from './note/entities/collect.entity';
import { UserFollow } from './user/entities/follow.entity';
import { CommentModule } from './comment/comment.module';
import { NoteComment } from './comment/entities/comment.entity';
import { WsModule } from './ws/ws.module';
import { ChatList } from './message/entities/chatList.entity';
import { ChatMessage } from './message/entities/chatMessage.entity';
import { MessageModule } from './message/message.module';
import { BlackList } from './user/entities/black.entity';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchModule } from './search/search.module';
import { StreamModule } from './stream/stream.module';
import { StreamEntity } from './stream/entities/stream.entity';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ElasticsearchModule.register({
      node: 'http://localhost:9200',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'BiSheBackEnd',
      synchronize: true,
      logging: true,
      entities: [
        User,
        BlackList,
        Note,
        NoteTags,
        NoteSections,
        UserNoteLike,
        UserNoteCollect,
        UserFollow,
        NoteComment,
        ChatList,
        ChatMessage,
        StreamEntity,
      ],
      poolSize: 10,
      connectorPackage: 'mysql2',
      extra: {
        authPlugin: 'sha256_password',
      },
    }),
    NoteModule,
    CommentModule,
    WsModule,
    MessageModule,
    SearchModule,
    StreamModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
