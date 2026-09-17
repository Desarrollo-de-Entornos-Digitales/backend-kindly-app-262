import { Module } from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { ParticipationController } from './participation.controller';

@Module({
  controllers: [ParticipationController],
  providers: [ParticipationService],
})
export class ParticipationModule {}
