import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateVolunteerAchievementDto {
    @IsInt({ message: 'volunteer_id must be an integer' })
    @IsPositive({ message: 'volunteer_id must be a positive integer' })
    @IsNotEmpty({ message: 'volunteer_id is required' })
    volunteer_id!: number;

    @IsInt({ message: 'achievement_id must be an integer' })
    @IsPositive({ message: 'achievement_id must be a positive integer' })
    @IsNotEmpty({ message: 'achievement_id is required' })
    achievement_id!: number;
}
