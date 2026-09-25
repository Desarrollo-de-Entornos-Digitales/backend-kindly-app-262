import { PartialType } from '@nestjs/mapped-types';
import { CreateVolunteerSkillDto } from './create-volunteer-skill.dto';

export class UpdateVolunteerSkillDto extends PartialType(CreateVolunteerSkillDto) {}
