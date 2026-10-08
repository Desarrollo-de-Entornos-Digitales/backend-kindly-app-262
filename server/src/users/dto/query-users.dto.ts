import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryUsersDto {
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
    @IsInt({ message: 'role_id must be an integer' })
    role_id?: number;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
    })
    @IsBoolean({ message: 'is_active must be a boolean value' })
    is_active?: boolean;
}
