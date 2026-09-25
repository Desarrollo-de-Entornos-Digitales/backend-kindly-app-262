import { Module } from '@nestjs/common';
import { ParticipationsService } from './participations.service';
import { ParticipationsController } from './participations.controller';
import { SubmissionModule } from './submission/submission.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  controllers: [ParticipationsController],
  providers: [ParticipationsService],
  imports: [SubmissionModule, AttendanceModule],
})
export class ParticipationsModule {}
