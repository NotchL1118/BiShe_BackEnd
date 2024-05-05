import { User } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.chatList)
  from_user: User; // 发送消息的用户

  @ManyToOne(() => User, (user) => user.receivedChatList)
  to_user: User; // 接收消息的用户

  @Column({
    comment: '消息内容',
    type: 'text',
  })
  content: string; // 消息内容

  @CreateDateColumn()
  createTime: Date;

  // @Column({
  //   comment: '是否是最后一条消息',
  // })
  // is_latest: boolean;
}
