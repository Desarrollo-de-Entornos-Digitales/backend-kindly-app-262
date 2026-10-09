import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateVolunteerCategoryDto {
    @IsInt({ message: 'volunteer_id must be an integer' })
    @IsPositive({ message: 'volunteer_id must be a positive integer' })
    @IsNotEmpty({ message: 'volunteer_id is required' })
    volunteer_id!: number;

    @IsInt({ message: 'category_id must be an integer' })
    @IsPositive({ message: 'category_id must be a positive integer' })
    @IsNotEmpty({ message: 'category_id is required' })
    category_id!: number;
}
