import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Cause } from '../causes/entities/cause.entity';
import { Volunteer } from '../volunteers/entities/volunteer.entity';
import { Submission } from '../participations/entities/submission.entity';
import { AuthModule } from '../auth/auth.module';
import { SubmissionModule } from '../participations/submission/submission.module';

@Module({
    imports: [TypeOrmModule.forFeature([Cause, Volunteer, Submission]), AuthModule, SubmissionModule],
    controllers: [MatchesController],
    providers: [MatchesService],
    exports: [MatchesService],
})
export class MatchesModule {}
