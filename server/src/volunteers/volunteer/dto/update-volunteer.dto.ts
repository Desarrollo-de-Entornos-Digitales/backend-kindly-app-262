import { PartialType } from '@nestjs/mapped-types';
import { CreateVolunteerDto } from './create-volunteer.dto';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateVolunteerDto extends PartialType(CreateVolunteerDto) {
    @IsInt({ message: 'completed_causes must be an integer' })
    @Min(0, { message: 'completed_causes cannot be negative' })
    @IsOptional()
    completed_causes?: number;
}
