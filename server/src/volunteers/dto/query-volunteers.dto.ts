import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryVolunteersDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'page must be an integer' })
    @Min(1, { message: 'page must be at least 1' })
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'limit must be an integer' })
    @Min(1, { message: 'limit must be at least 1' })
    limit?: number = 10;

    @IsOptional()
    @IsString({ message: 'search query must be a string' })
    search?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'skill_id must be an integer' })
    skill_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'category_id must be an integer' })
    category_id?: number;
}
