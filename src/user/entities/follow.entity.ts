import { User } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'user_user_follow_tag',
})
export class UserFollow {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.fans, { onDelete: 'CASCADE' })
  // 被关注的人
  follow: User;

  @ManyToOne(() => User, (user) => user.followUsers, { onDelete: 'CASCADE' })
  // 粉丝
  fan: User;

  // @Column({
  //   default: false,
  //   comment: '是否互相关注 1是 0否',
  // })
  // isFollowEachOther: boolean;

  @Column({
    default: false,
    comment: '接收者是否已读 1已读 0未读',
  })
  isRead: boolean;

  @CreateDateColumn()
  createTime: Date;
}
