import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import { createCommentDto } from './dto/comment.dto';
import { MyRequest } from 'src/types';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('getNoteComments')
  async getNoteComments(@Query('id') noteId: number) {
    return await this.commentService.getNoteComments(noteId);
  }

  @Post('createNoteComments')
  async createNoteComments(@Body() dtoInfo: createCommentDto, @Req() req: MyRequest) {
    const { user } = req;
    return await this.commentService.createNoteComments(user.id, dtoInfo);
  }

  // 删除评论
  @Post('deleteNoteComment')
  async deleteNoteComment(@Body('id') id: number) {
    return await this.commentService.deleteNoteComment(id);
  }

  // 获取未读评论
  @Get('getUnreadComments')
  async getUnreadComments(@Req() req: MyRequest) {
    const { id } = req.user;
    return await this.commentService.getUnreadComments(id);
  }

  // 获取已读评论
  @Get('getReadComments')
  async getReadComments(@Req() req: MyRequest) {
    const { id } = req.user;
    return await this.commentService.getReadComments(id);
  }
}
