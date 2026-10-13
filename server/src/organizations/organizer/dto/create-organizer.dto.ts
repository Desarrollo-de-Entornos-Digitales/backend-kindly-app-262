import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUrl, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrganizerDto {
    @IsInt({ message: 'user_id must be an integer' })
    @IsPositive({ message: 'user_id must be a positive number' })
    @IsOptional()
    @Type(() => Number)
    user_id?: number;

    @IsString({ message: 'name must be a string' })
    @IsNotEmpty({ message: 'name should not be empty' })
    name!: string;

    @IsString({ message: 'description must be a string' })
    @IsNotEmpty({ message: 'description should not be empty' })
    description!: string;

    @IsBoolean({ message: 'is_organization must be a boolean' })
    is_organization!: boolean;

    @IsInt({ message: 'organization_type_id must be an integer' })
    @IsPositive({ message: 'organization_type_id must be a positive number' })
    @Type(() => Number)
    organization_type_id!: number;

    @ValidateIf((o: CreateOrganizerDto) => o.is_organization === true)
    @IsNotEmpty({ message: 'website is required for organizations' })
    @IsUrl({}, { message: 'website must be a valid URL address' })
    website?: string;

    @ValidateIf((o: CreateOrganizerDto) => o.is_organization === true)
    @IsNotEmpty({ message: 'verification_file is required for organizations' })
    @IsString({ message: 'verification_file must be a string' })
    verification_file?: string;
}
