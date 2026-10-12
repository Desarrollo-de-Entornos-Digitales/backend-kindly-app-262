import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FilterCausesCategoryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'category_id must be an integer' })
    @Min(1, { message: 'category_id must be at least 1' })
    category_id?: number;

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString({ message: 'category_name must be a string' })
    category_name?: string;
}
