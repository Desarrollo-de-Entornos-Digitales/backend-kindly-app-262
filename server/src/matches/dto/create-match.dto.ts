import { IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateMatchDto {
    @IsInt({ message: 'cause_id must be an integer' })
    @IsPositive({ message: 'cause_id must be a positive integer' })
    cause_id!: number;

    @IsOptional()
    @IsString({ message: 'justification must be a string' })
    @MaxLength(1000, { message: 'justification must not exceed 1000 characters' })
    justification?: string;
}
