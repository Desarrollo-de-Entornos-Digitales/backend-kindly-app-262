import { PartialType } from '@nestjs/mapped-types';
import { CreateVolunteerCategoryDto } from './create-volunteer-category.dto';

export class UpdateVolunteerCategoryDto extends PartialType(CreateVolunteerCategoryDto) {}
