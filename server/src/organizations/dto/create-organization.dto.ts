import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrganizerDto } from '../organizer/dto/create-organizer.dto';

export class CreateOrganizationDto extends CreateOrganizerDto {
    @IsOptional()
    @IsInt({ message: 'user_id must be an integer' })
    @IsPositive({ message: 'user_id must be a positive number' })
    @Type(() => Number)
    user_id?: number;
}
