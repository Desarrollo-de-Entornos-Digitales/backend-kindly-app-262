import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { Cause } from '../../causes/entities/cause.entity';
import { Organizer } from '../../organizations/entities/organizer.entity';
import { Volunteer } from '../../volunteers/entities/volunteer.entity';
import { Submission } from '../entities/submission.entity';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Submission, Cause, Volunteer, Organizer]), AuthModule],
    controllers: [SubmissionController],
    providers: [SubmissionService],
    exports: [SubmissionService],
})
export class SubmissionModule {}
