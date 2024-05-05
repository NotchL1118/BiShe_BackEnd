import { User } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class StreamEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '直播间名称',
    length: 20,
  })
  roomName: string;

  @Column({
    comment: '直播间封面',
    length: 200,
  })
  roomCover: string;

  @Column({
    comment: '直播间状态',
  })
  isLive: boolean;

  @Column({
    comment: '直播间地址,直接使用userId，http://localhost:8887/live/Userid',
    length: 200,
    unique: true,
  })
  roomUrl: string;

  @JoinColumn()
  @OneToOne(() => User)
  creater: User;

  @CreateDateColumn()
  createTime: Date;
}
