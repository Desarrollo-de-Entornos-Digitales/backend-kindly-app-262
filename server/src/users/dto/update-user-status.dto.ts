import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusDto {
    @IsBoolean({ message: 'is_active must be a boolean value' })
    @IsNotEmpty({ message: 'is_active is required' })
    is_active!: boolean;
}
