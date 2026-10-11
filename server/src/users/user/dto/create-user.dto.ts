import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    name!: string;

    @IsString({ message: 'Username must be a string' })
    @IsNotEmpty({ message: 'Username is required' })
    username!: string;

    @IsEmail({}, { message: 'Must provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email!: string;

    @IsString({ message: 'Contact must be a string' })
    @IsNotEmpty({ message: 'Contact is required' })
    contact!: string;

    @IsOptional()
    @IsString({ message: 'profile_picture must be a string URL' })
    profile_picture?: string;

    @IsString({ message: 'Password must be a string' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    passwordHash!: string;

    @IsInt({ message: 'Role ID must be an integer' })
    @IsNotEmpty({ message: 'Role ID is required' })
    roleId!: number;

    @IsOptional()
    is_active?: boolean;
}
