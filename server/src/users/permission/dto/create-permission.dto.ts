import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionDto {
    @IsString()
    @IsNotEmpty({ message: 'The permission name is required' })
    name!: string;

    @IsString()
    @IsNotEmpty({ message: 'The permission description is required.' })
    description!: string;
}
