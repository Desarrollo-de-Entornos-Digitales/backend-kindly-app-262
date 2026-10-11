import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAnnouncementDto {
    @IsString({ message: 'title must be a string' })
    @IsNotEmpty({ message: 'title should not be empty' })
    @MaxLength(255, { message: 'title must not exceed 255 characters' })
    title!: string;

    @IsString({ message: 'text must be a string' })
    @IsNotEmpty({ message: 'text should not be empty' })
    text!: string;
}
