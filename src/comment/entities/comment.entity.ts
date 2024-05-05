// 收藏功能
import { Note } from 'src/note/entities/note.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

@Entity({
  name: 'comments',
})
@Tree('closure-table')
export class NoteComment {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createTime: Date;

  // 评论内容
  @Column({
    type: 'text',
    comment: '评论内容',
  })
  content: string;

  // 评论作者
  @ManyToOne(() => User, (user) => user.comments)
  author: User;

  // 评论接收者
  @ManyToOne(() => User, (user) => user.receivedComments)
  receiver: User;

  @Column({
    default: false,
    comment: '评论接收者是否已读 1已读 0未读',
  })
  isRead: boolean;

  // 评论的文章
  @ManyToOne(() => Note, (note) => note.comments)
  note: Note;

  // 回复哪一条评论,一级评论的话就为null
  @ManyToOne(() => NoteComment, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  repleyTo?: NoteComment;

  // 二级子评论
  @TreeChildren({
    cascade: true,
  })
  children: NoteComment[];

  // 父评论
  @TreeParent({
    onDelete: 'CASCADE',
  })
  parent: NoteComment;
}
