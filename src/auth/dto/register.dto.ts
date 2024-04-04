import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export enum Sex {
  '男' = 0,
  '女' = 1,
}

export class RegisterDto {
  @IsNotEmpty({
    message: '用户名不能为空',
  })
  @MinLength(6, {
    message: '用户名长度不能小于6位',
  })
  @MaxLength(16, {
    message: '用户名长度不能大于16位',
  })
  username: string;
  @IsNotEmpty({
    message: '昵称不能为空',
  })
  nickname: string;

  @IsNotEmpty({
    message: '密码不能为空',
  })
  @MinLength(6, {
    message: '密码长度不能小于6位',
  })
  @MaxLength(16, {
    message: '密码长度不能大于16位',
  })
  password: string;
  // 性别
  @IsNotEmpty({
    message: '性别不能为空',
  })
  sex: Sex;
}
