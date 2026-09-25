import { Module } from '@nestjs/common';
import { CauseService } from './cause.service';
import { CauseController } from './cause.controller';

@Module({
  controllers: [CauseController],
  providers: [CauseService],
})
export class CauseModule {}
