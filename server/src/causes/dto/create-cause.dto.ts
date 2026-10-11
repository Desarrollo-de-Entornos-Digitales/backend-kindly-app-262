import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCauseDto {
    @IsInt({ message: 'organizer_id must be an integer' })
    @IsPositive({ message: 'organizer_id must be a positive number' })
    @Type(() => Number)
    organizer_id!: number;

    @IsInt({ message: 'category_id must be an integer' })
    @IsPositive({ message: 'category_id must be a positive number' })
    @Type(() => Number)
    category_id!: number;

    @IsString({ message: 'title must be a string' })
    @IsNotEmpty({ message: 'title should not be empty' })
    title!: string;

    @IsUrl({}, { message: 'cover_image_url must be a URL address' })
    @IsNotEmpty({ message: 'cover_image_url should not be empty' })
    cover_image_url!: string;

    @IsString({ message: 'description must be a string' })
    @IsNotEmpty({ message: 'description should not be empty' })
    description!: string;

    @IsOptional()
    @IsInt({ message: 'capacity must be an integer' })
    @IsPositive({ message: 'capacity must be a positive number' })
    @Type(() => Number)
    capacity?: number;

    @IsDateString({}, { message: 'start_date must be a valid ISO 8601 date string' })
    start_date!: string;

    @IsDateString({}, { message: 'end_date must be a valid ISO 8601 date string' })
    end_date!: string;

    @IsString({ message: 'address must be a string' })
    @IsNotEmpty({ message: 'address should not be empty' })
    address!: string;

    @IsString({ message: 'location_latitude must be a string' })
    @IsNotEmpty({ message: 'location_latitude should not be empty' })
    location_latitude!: string;

    @IsString({ message: 'location_longitude must be a string' })
    @IsNotEmpty({ message: 'location_longitude should not be empty' })
    location_longitude!: string;
}
