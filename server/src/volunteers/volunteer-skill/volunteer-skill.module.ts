import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerSkill } from './entities/volunteer-skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VolunteerSkill])],
  exports: [TypeOrmModule],
})
export class VolunteerSkillModule {}

