import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [UserModule, AuthModule, TestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
