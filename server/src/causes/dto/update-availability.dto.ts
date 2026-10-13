import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateAvailabilityDto {
    @Type(() => Object)
    @IsBoolean({ message: 'is_available must be a boolean value' })
    @IsNotEmpty({ message: 'is_available is required' })
    is_available!: boolean;
}
