import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerSkillService } from './volunteer-skill.service';
import { VolunteerSkillController } from './volunteer-skill.controller';
import { VolunteerSkill } from '../entities/volunteer-skill.entity';
import { Volunteer } from '../entities/volunteer.entity';
import { Skill } from '../entities/skill.entity';

@Module({
    imports: [TypeOrmModule.forFeature([VolunteerSkill, Volunteer, Skill])],
    controllers: [VolunteerSkillController],
    providers: [VolunteerSkillService],
    exports: [VolunteerSkillService],
})
export class VolunteerSkillModule {}
