import { UserNoteCollect } from 'src/note/entities/collect.entity';
import { UserNoteLike } from 'src/note/entities/like.entity';
import { Note } from 'src/note/entities/note.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserFollow } from './follow.entity';
import { NoteComment } from 'src/comment/entities/comment.entity';
import { ChatList } from 'src/message/entities/chatList.entity';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50,
    comment: '用户名,用来登录用的',
    unique: true,
  })
  username: string;

  @Column({
    length: 50,
    comment: '密码',
  })
  password: string;

  @Column({
    name: 'nick_name',
    length: 50,
    comment: '用户昵称',
  })
  nickname: string;

  @Column({
    length: 30,
    comment: '个人',
    default: '这个人什么都没有写~',
  })
  description: string;

  @Column({
    comment: '头像',
    length: 100,
    nullable: true,
    default: 'http://pic.lsyfighting.cn/avatar.png',
  })
  avatar: string;

  @Column({
    comment: '性别 0:男 1:女',
    default: 0,
  })
  sex: number;

  @OneToMany(() => Note, (note) => note.author, {
    cascade: true,
  })
  notes: Note[];

  @OneToMany(() => UserNoteLike, (like) => like.user)
  notesLiked: UserNoteLike[];

  @OneToMany(() => UserNoteCollect, (collect) => collect.user)
  notesCollectd: UserNoteCollect[];

  @OneToMany(() => UserFollow, (follow) => follow.fan)
  followUsers: UserFollow[];

  @OneToMany(() => UserFollow, (follow) => follow.follow)
  fans: UserFollow[];

  @OneToMany(() => NoteComment, (comment) => comment.author)
  comments: NoteComment[];

  @OneToMany(() => NoteComment, (comment) => comment.receiver)
  receivedComments: NoteComment[];

  @OneToMany(() => ChatList, (chatList) => chatList.from_user)
  chatList: ChatList[]; // 消息列表

  @OneToMany(() => ChatList, (chatList) => chatList.to_user)
  receivedChatList: ChatList[]; // 接收到的消息列表

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
