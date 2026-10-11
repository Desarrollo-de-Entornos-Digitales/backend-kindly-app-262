import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerService } from './volunteer.service';
import { VolunteerController } from './volunteer.controller';
import { Volunteer } from '../entities/volunteer.entity';
import { User } from '../../users/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Volunteer, User])],
    controllers: [VolunteerController],
    providers: [VolunteerService],
    exports: [VolunteerService],
})
export class VolunteerModule {}
