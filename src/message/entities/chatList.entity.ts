import { User } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ChatMessage } from './chatMessage.entity';

@Entity()
export class ChatList {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.chatList)
  from_user: User; // 发送消息的用户

  @ManyToOne(() => User, (user) => user.receivedChatList)
  to_user: User; // 接收消息的用户

  @Column({
    comment: '未读消息数',
    default: 0,
  })
  unread: number; // 未读消息数

  @Column({
    comment: '是否被发送者删除',
    default: true,
  })
  status: boolean; // 是否被发送者删除 1未删除 0删除

  @ManyToOne(() => ChatMessage)
  lastMessage: ChatMessage; // 最后一条消息

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
