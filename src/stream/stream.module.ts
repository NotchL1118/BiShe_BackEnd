import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, OnModuleInit } from '@nestjs/common';
import { StreamService } from './stream.service';
import { StreamController } from './stream.controller';
import { StreamEntity } from './entities/stream.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StreamEntity])],
  controllers: [StreamController],
  providers: [StreamService],
})
export class StreamModule implements OnModuleInit {
  constructor(private readonly streamService: StreamService) {}

  onModuleInit() {
    this.streamService.createStream();
  }
}
