import { PartialType } from '@nestjs/mapped-types';
import { CreateVolunteerAchievementDto } from './create-volunteer-achievement.dto';

export class UpdateVolunteerAchievementDto extends PartialType(CreateVolunteerAchievementDto) {}
