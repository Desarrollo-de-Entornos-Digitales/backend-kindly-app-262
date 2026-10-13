import { IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class CreateVolunteerSkillDto {
    @IsInt({ message: 'volunteer_id must be an integer' })
    @IsPositive({ message: 'volunteer_id must be a positive integer' })
    @IsOptional()
    volunteer_id?: number;

    @IsInt({ message: 'skill_id must be an integer' })
    @IsPositive({ message: 'skill_id must be a positive integer' })
    @IsNotEmpty({ message: 'skill_id is required' })
    skill_id!: number;
}
