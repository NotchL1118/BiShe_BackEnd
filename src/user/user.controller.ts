import { Controller, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { MyRequest } from 'src/types';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('getUserInfo')
  async getUserInfo(@Req() req: MyRequest) {
    const { id } = req.user;
    console.log(req['user']);
    return await this.userService.getUserInfo(id);
  }
}
