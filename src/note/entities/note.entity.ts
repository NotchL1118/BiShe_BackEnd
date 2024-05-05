import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NoteSections } from './secetions.entity';
import { UserNoteLike } from './like.entity';
import { UserNoteCollect } from './collect.entity';
import { NoteComment } from 'src/comment/entities/comment.entity';

@Entity({
  name: 'notes',
})
export class Note {
  @PrimaryGeneratedColumn({
    comment: '笔记id',
    name: 'note_id',
  })
  id: number;

  @ManyToOne(() => User, (user) => user.notes, { onDelete: 'SET NULL' })
  author: User;

  @OneToMany(() => UserNoteLike, (like) => like.note)
  peopleLiked: UserNoteLike[];

  @OneToMany(() => UserNoteCollect, (collect) => collect.note)
  peopleCollected: UserNoteCollect[];

  @Column({
    length: 30,
    comment: '标题',
  })
  title: string;

  @Column({
    type: 'text',
    comment: '内容',
  })
  content: string;

  @Column({
    type: 'text',
    comment: '封面图片',
  })
  coverUrl: string;

  @Column({
    type: 'simple-array',
    comment: '标签',
  })
  tags: string[];

  // 文章所属的板块
  @ManyToOne(() => NoteSections, {
    onDelete: 'SET NULL',
  })
  section: NoteSections;

  @Column({
    comment: '类型 0:只有图片 1:带视频',
    default: 0,
  })
  type: number;

  @Column({
    comment: '点赞数',
    default: 0,
  })
  likeCount: number;

  @Column({
    comment: '收藏数',
    default: 0,
  })
  collectionCount: number;

  @Column({
    comment: '评论数',
    default: 0,
  })
  commentCount: number;

  @Column({
    comment: '点击数',
    default: 0,
  })
  clickCount: number;

  @Column({
    type: 'simple-array',
    comment: '图片或者视频的url',
  })
  urls: string[];

  // 文章的评论
  @OneToMany(() => NoteComment, (comment) => comment.note)
  comments: NoteComment[];

  @Column({
    comment: '是否置顶',
    default: false,
  })
  isTop: boolean;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
