import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSkillDto {
    @IsString({ message: 'Skill must be a string' })
    @IsNotEmpty({ message: 'Skill name is required' })
    name!: string;

    @IsOptional()
    @IsString({ message: 'Skill description must be a string' })
    description!: string;
}
