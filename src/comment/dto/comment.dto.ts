import { IsNotEmpty } from 'class-validator';

export class createCommentDto {
  @IsNotEmpty({
    message: '文章id不能为空',
  })
  noteId: number;
  @IsNotEmpty({
    message: '接收者id不能为空',
  })
  receiverId: number;
  @IsNotEmpty({
    message: '评论内容不能为空',
  })
  content: string;
  repleyTo?: number;
  parentCommentId?: number;
}
