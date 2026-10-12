import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrganizationTypeDto {
    @IsString({ message: 'name must be a string' })
    @IsNotEmpty({ message: 'name should not be empty' })
    name!: string;

    @IsString({ message: 'description must be a string' })
    @IsNotEmpty({ message: 'description should not be empty' })
    description!: string;
}
