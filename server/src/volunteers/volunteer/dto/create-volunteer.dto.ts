import { IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateVolunteerDto {
    @IsInt({ message: 'user_id must be an integer' })
    @IsPositive({ message: 'user_id must be a positive integer' })
    @IsNotEmpty({ message: 'user_id is required' })
    user_id!: number;

    @IsString({ message: 'description must be a string' })
    @IsOptional()
    description?: string;

    @IsIn(['XS', 'S', 'M', 'L', 'XL', 'XXL'], {
        message: 'shirt_size must be one of: XS, S, M, L, XL, XXL',
    })
    @IsNotEmpty({ message: 'shirt_size is required' })
    shirt_size!: string;

    @IsString({ message: 'height must be a string' })
    @IsNotEmpty({ message: 'height is required' })
    height!: string;

    @IsString({ message: 'health_center must be a string' })
    @IsNotEmpty({ message: 'health_center is required' })
    health_center!: string;

    @IsIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
        message: 'blood_type must be a valid blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)',
    })
    @IsNotEmpty({ message: 'blood_type is required' })
    blood_type!: string;

    @IsString({ message: 'emergency_contact must be a string' })
    @IsNotEmpty({ message: 'emergency_contact is required' })
    emergency_contact!: string;
}
