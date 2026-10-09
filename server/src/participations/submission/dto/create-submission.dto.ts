import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateSubmissionDto {
    @IsInt()
    @IsPositive()
    volunteer_id!: number;

    @IsInt()
    @IsPositive()
    cause_id!: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    justification!: string;
}
