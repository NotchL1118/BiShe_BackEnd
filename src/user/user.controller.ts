import { Body, Controller, Get, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { MyRequest } from 'src/types';
import { UpdateUserInfoDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 得到个人信息
  @Get('getUserInfo')
  async getUserInfo(@Req() req: MyRequest, @Query('id') selectId: number) {
    const { id: currentId } = req.user;
    return await this.userService.getUserInfo(currentId, selectId || currentId);
  }

  // 获取用户上传的作品
  @Get('getUserUploadNotes')
  async getUserUploadNotes(@Req() req: MyRequest, @Query('id') selectId: number) {
    const { id: currentUserId } = req.user;
    if (selectId === undefined || !selectId) selectId = currentUserId;
    return await this.userService.getUserUploadNotes(currentUserId, selectId);
  }
  // 获取用户点赞的作品
  @Get('getUserLikeNotes')
  async getUserLikeNotes(@Req() req: MyRequest, @Query('id') selectId: number) {
    const { id: currentUserId } = req.user;
    if (selectId === undefined || !selectId) selectId = currentUserId;
    return await this.userService.getUserLikeNotes(currentUserId, selectId);
  }
  // 获取用户收藏的作品
  @Get('getUserCollectNotes')
  async getUserCollectNotes(@Req() req: MyRequest, @Query('id') selectId: number) {
    const { id: currentUserId } = req.user;
    if (selectId === undefined || !selectId) selectId = currentUserId;
    return await this.userService.getUserCollectNotes(currentUserId, selectId);
  }
  // 更新用户信息
  @Post('updateUserInfo')
  async updateUserInfo(@Req() req: MyRequest, @Body() updateUserInfoDto: UpdateUserInfoDto) {
    const { id: currentUserId } = req.user;
    return await this.userService.updateUserInfo(currentUserId, updateUserInfoDto);
  }

  // 关注
  @Post('follow')
  async follow(@Req() req: MyRequest, @Query('id', ParseIntPipe) id: number) {
    const { id: currentUserId } = req.user;
    return await this.userService.followUser(currentUserId, id);
  }
  // 取消关注
  @Post('cancelFollow')
  async cancelFollow(@Req() req: MyRequest, @Query('id') id: number) {
    const { id: currentUserId } = req.user;
    return await this.userService.cancelfollowUser(currentUserId, id);
  }

  // 获取关注列表
  @Get('getFollowList')
  async getFollowList(@Req() req: MyRequest) {
    const { id: currentUserId } = req.user;
    return await this.userService.getUserFollowList(currentUserId);
  }

  // 检测是否被拉黑
  @Get('checkBlack')
  async checkBlack(@Req() req: MyRequest, @Query('id') id: number) {
    const { id: currentUserId } = req.user;
    return await this.userService.checkBlack(currentUserId, id);
  }

  // 拉黑
  @Post('blackUser')
  async blackUser(@Req() req: MyRequest, @Body('id') id: number) {
    const { id: currentUserId } = req.user;
    return await this.userService.blackUser(currentUserId, id);
  }

  // 取消拉黑
  @Post('cancelBlackUser')
  async cancelBlack(@Req() req: MyRequest, @Body('id') id: number) {
    const { id: currentUserId } = req.user;
    return await this.userService.cancelBlackUser(currentUserId, id);
  }

  // 获取被关注记录列表
  @Get('getReceivedFollowRecords')
  async getReceivedFollowRecords(@Req() req: MyRequest) {
    const { id: currentUserId } = req.user;
    return await this.userService.getReceivedFollowRecords(currentUserId);
  }
}
