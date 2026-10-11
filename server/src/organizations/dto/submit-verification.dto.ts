import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitVerificationDto {
    @IsString({ message: 'verification_file must be a string' })
    @IsNotEmpty({ message: 'verification_file should not be empty' })
    verification_file!: string;
}
