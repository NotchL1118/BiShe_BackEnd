import { Body, Controller, Get, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { NoteService } from './note.service';
import { MyRequest } from 'src/types';
import { addNoteDto, updateNoteDto } from './dto/note.dto';
import { Public, PublicShouldAddUser } from 'src/utils/public';

@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}
  @Get('getUploadToken')
  async getUploadToken() {
    return this.noteService.getUploadToken();
  }
  @Post('uploadNote')
  async addNote(@Req() req: MyRequest, @Body() noteInfo: addNoteDto) {
    return await this.noteService.addNoteByAuthorId(req.user.id, noteInfo);
  }

  @Post('deleteNote')
  async deleteNote(@Req() req: MyRequest, @Body() noteInfo: { id: number }) {
    return await this.noteService.deleteNoteById(req.user.id, noteInfo.id);
  }

  @Post('updateNote')
  async updateNoteDto(@Req() req: MyRequest, @Body() noteInfo: updateNoteDto) {
    return await this.noteService.updateNoteByAuthorId(req.user.id, noteInfo);
  }

  @Public()
  @Get('getAllNoteTags')
  async getAllNoteTags() {
    return this.noteService.getAllNoteTags();
  }

  @Public()
  @Get('getAllNoteSections')
  async getAllNoteSections() {
    return this.noteService.getAllNoteSections();
  }

  @Public()
  @PublicShouldAddUser()
  @Get('getAllNoteList')
  async getAllNoteList(@Query('start') startNum: number, @Query('section') section: number, @Req() req: MyRequest) {
    return this.noteService.getAllNoteList(startNum, section, req.user?.id);
  }
  // 点赞
  @Post('likeNote')
  async likeNote(@Req() req: MyRequest, @Query('noteId') noteId: number) {
    return this.noteService.likeNoteByUserId(req.user.id, noteId);
  }
  // 取消点赞
  @Post('unlikeNote')
  async unlikeNote(@Req() req: MyRequest, @Query('noteId') noteId: number) {
    return this.noteService.unlikeNoteByUserId(req.user.id, noteId);
  }
  // 收藏
  @Post('collectNote')
  async collectNote(@Req() req: MyRequest, @Query('noteId') noteId: number) {
    return this.noteService.collectNote(req.user.id, noteId);
  }
  // 取消收藏
  @Post('uncollectNote')
  async uncollectNote(@Req() req: MyRequest, @Query('noteId') noteId: number) {
    return this.noteService.uncollectNote(req.user.id, noteId);
  }
  // 获取作品详情
  @Get('getNoteDetail')
  async getNoteDetail(@Query('id', ParseIntPipe) noteId: number, @Req() req: MyRequest) {
    return this.noteService.getNoteDetail(req.user?.id, noteId);
  }

  @Get('getNoteSection')
  async getNoteSection(@Query('id', ParseIntPipe) sectionId: number) {
    return this.noteService.getNoteSection(sectionId);
  }

  // 获取用户被点赞的记录, 用于消息通知，返回的未读的消息 + 已读的20条消息
  @Get('getReceivedLikeRecords')
  async getReceivedLikeRecords(@Req() req: MyRequest) {
    return this.noteService.getReceivedLikeRecords(req.user.id);
  }

  // 获取用户被收藏的记录, 用于消息通知，返回的未读的消息 + 已读的20条消息
  @Get('getReceivedCollectRecords')
  async getReceivedCollectRecords(@Req() req: MyRequest) {
    return this.noteService.getReceivedCollectRecords(req.user.id);
  }
}
