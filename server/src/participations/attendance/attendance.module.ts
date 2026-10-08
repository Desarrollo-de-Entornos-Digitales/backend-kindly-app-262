import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cause } from '../../causes/entities/cause.entity';
import { Volunteer } from '../../volunteers/entities/volunteer.entity';
import { Attendance } from '../entities/attendance.entity';
import { Submission } from '../entities/submission.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Attendance, Cause, Submission, Volunteer])],
    controllers: [AttendanceController],
    providers: [AttendanceService],
})
export class AttendanceModule {}
