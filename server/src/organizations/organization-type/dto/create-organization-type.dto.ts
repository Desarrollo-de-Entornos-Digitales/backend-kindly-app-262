import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrganizationTypeDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsOptional()
    description!: string;
}
