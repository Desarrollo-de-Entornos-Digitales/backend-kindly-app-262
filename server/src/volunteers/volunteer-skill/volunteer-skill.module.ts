import { Module } from '@nestjs/common';
import { VolunteerSkillService } from './volunteer-skill.service';
import { VolunteerSkillController } from './volunteer-skill.controller';

@Module({
    controllers: [VolunteerSkillController],
    providers: [VolunteerSkillService],
})
export class VolunteerSkillModule {}
