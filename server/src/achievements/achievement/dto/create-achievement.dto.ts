import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAchievementDto {
    @IsString({ message: 'name must be a string' })
    @IsNotEmpty({ message: 'name is required' })
    name!: string;

    @IsString({ message: 'color must be a string' })
    @IsNotEmpty({ message: 'color is required' })
    color!: string;

    @IsString({ message: 'icon must be a string' })
    @IsNotEmpty({ message: 'icon is required' })
    icon!: string;

    @IsString({ message: 'description must be a string' })
    @IsNotEmpty({ message: 'description is required' })
    description!: string;
}
