import { IsNotEmpty } from 'class-validator';

export class addNoteDto {
  @IsNotEmpty({
    message: '标题不能为空',
  })
  title: string;
  @IsNotEmpty({
    message: '内容不能为空',
  })
  content: string;
  coverUrl: string;
  urls: string[];
  tags: string[];
  section: number;
  type: number;
}

export class updateNoteDto {
  @IsNotEmpty({
    message: 'id不能为空',
  })
  id: number;
  @IsNotEmpty({
    message: '标题不能为空',
  })
  title: string;
  @IsNotEmpty({
    message: '内容不能为空',
  })
  content: string;
  coverUrl: string;
  urls: string[];
  tags: string[];
  section: number;
  type: number;
}
