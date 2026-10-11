import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty({ message: 'Category name is required' })
    name!: string;

    @IsOptional()
    @IsString({ message: 'Category Description must be a string' })
    description?: string;
}
