import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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
    comment: '头像',
    length: 100,
    nullable: true,
  })
  avatar: string;

  @Column({
    comment: '性别 0:男 1:女',
    default: 0,
  })
  sex: number;
  //   @Column({
  //     comment: '是否冻结',
  //     default: false,
  //   })
  //   isFrozen: boolean;

  //   @Column({
  //     comment: '是否是管理员',
  //     default: false,
  //   })
  //   isAdmin: boolean;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
