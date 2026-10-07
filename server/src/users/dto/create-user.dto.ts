import { IsString, IsInt, IsEmail, IsOptional, MinLength, IsUrl, IsEnum, IsNotEmpty } from 'class-validator';

// Allowed status
export enum UserStatus {
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
}

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsInt()
    @IsNotEmpty({ message: 'You must specify the user role id' })
    role_id!: number;

    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsEmail({}, { message: 'You must enter a valid email address' })
    @IsNotEmpty()
    email!: string;

    @IsOptional()
    @IsString()
    @IsUrl()
    profile_picture?: string;

    @IsOptional()
    @IsString()
    contact?: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'The password must be at least 8 characters long' })
    passwordHash!: string;

    @IsEnum(UserStatus, {
        message: 'The status must be active or suspended.',
    })
    @IsNotEmpty()
    status!: UserStatus;
}
