import { IsInt, IsPositive } from 'class-validator';

export class DismissMatchDto {
    @IsInt({ message: 'cause_id must be an integer' })
    @IsPositive({ message: 'cause_id must be a positive integer' })
    cause_id!: number;
}
