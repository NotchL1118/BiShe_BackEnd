import { User } from 'src/user/entities/user.entity';
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BlackList {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  // 实行拉黑行为的人
  from_user: User;

  @ManyToOne(() => User)
  // 被拉黑的人
  to_user: User;

  @CreateDateColumn()
  createTime: Date;
}
