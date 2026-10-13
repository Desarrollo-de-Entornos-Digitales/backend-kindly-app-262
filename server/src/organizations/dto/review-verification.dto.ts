import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviewVerificationDto {
    @IsString({ message: 'status must be a string' })
    @IsNotEmpty({ message: 'status should not be empty' })
    @IsIn(['verified', 'rejected'], { message: 'status must be either verified or rejected' })
    status!: 'verified' | 'rejected';

    @IsOptional()
    @IsString({ message: 'feedback must be a string' })
    feedback?: string;
}
