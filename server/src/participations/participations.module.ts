import { Module } from '@nestjs/common';
import { ParticipationsService } from './participations.service';
import { ParticipationsController } from './participations.controller';
import { SubmissionModule } from './submission/submission.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [SubmissionModule, AttendanceModule],
  controllers: [ParticipationsController],
  providers: [ParticipationsService],
  exports: [SubmissionModule, AttendanceModule],
})
export class ParticipationsModule {}
