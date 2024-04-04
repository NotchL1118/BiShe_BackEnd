import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { md5 } from 'src/utils/auth';
import { defaultAvatar } from './constants';
import { loginUserVo } from './vo/login-user.vo';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
  private readonly logger = new Logger(AuthService.name);

  async login(loginDto: LoginDto): Promise<loginUserVo> {
    const { username, password } = loginDto;
    const foundUser = await this.userRepository.findOneBy({
      username,
    });
    if (!foundUser) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    if (foundUser.password !== md5(password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }
    const token = await this.jwtService.signAsync({
      id: foundUser.id,
      username: foundUser.username,
    });
    const vo = new loginUserVo();
    vo.token = token;
    vo.userInfo = foundUser;
    return vo;
  }

  async register(registerDto: RegisterDto) {
    const regExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/;
    if (!regExp.test(registerDto.username)) {
      throw new HttpException('用户名必须包含字母和数字', HttpStatus.BAD_REQUEST);
    }
    const foundUser = await this.userRepository.findOneBy({
      username: registerDto.username,
    });
    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }
    const newUser = new User();
    newUser.username = registerDto.username;
    newUser.password = md5(registerDto.password);
    newUser.nickname = registerDto.nickname;
    newUser.sex = registerDto.sex;
    newUser.avatar = defaultAvatar;
    try {
      await this.userRepository.save(newUser);
      return '注册成功';
    } catch (e) {
      this.logger.error(e, AuthService);
      throw new HttpException('注册失败,请稍后再试', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
