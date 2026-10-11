import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryOrganizationsDto {
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
    @IsInt({ message: 'organization_type_id must be an integer' })
    organization_type_id?: number;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    is_organization?: boolean;

    @IsOptional()
    @IsString()
    @IsIn(['verified', 'pending', 'rejected', 'unverified'], {
        message: 'verification_status must be verified, pending, rejected, or unverified',
    })
    verification_status?: string;
}
