// 收藏功能
import { User } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from './note.entity';

@Entity({
  name: 'user_note_collect_tag',
})
export class UserNoteCollect {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.notesCollectd, { onDelete: 'CASCADE', cascade: true })
  user: User;

  @ManyToOne(() => Note, (note) => note.peopleCollected, { onDelete: 'CASCADE', cascade: true })
  note: Note;

  @ManyToOne(() => User)
  receiver: User;

  @Column({
    default: false,
    comment: '评论接收者是否已读 1已读 0未读',
  })
  isRead: boolean;

  @CreateDateColumn()
  createTime: Date;
}
