import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerSkillService } from './volunteer-skill.service';
import { VolunteerSkillController } from './volunteer-skill.controller';
import { VolunteerSkill } from '../entities/volunteer-skill.entity';
import { Volunteer } from '../entities/volunteer.entity';
import { Skill } from '../entities/skill.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([VolunteerSkill, Volunteer, Skill]), AuthModule],
    controllers: [VolunteerSkillController],
    providers: [VolunteerSkillService],
    exports: [VolunteerSkillService],
})
export class VolunteerSkillModule {}
