import { IsNotEmpty } from 'class-validator';

export class UpdateUserInfoDto {
  @IsNotEmpty({
    message: '昵称不能为空',
  })
  nickname: string;
  avatar: string;
  description: string;
  @IsNotEmpty({
    message: '性别不能为空',
  })
  sex: number;
}
