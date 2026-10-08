import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name!: string;

    @IsString()
    @IsNotEmpty({ message: 'Username is required' })
    username!: string;

    @IsEmail({}, { message: 'Must provide a valid email address.' })
    @IsNotEmpty({ message: 'Email address is required' })
    email!: string;

    @IsString()
    contact!: string;

    @IsString()
    @MinLength(6, { message: 'The password must be at least 6 characters long' })
    password!: string;

    @IsString()
    @IsNotEmpty({ message: 'You must select a role (volunteer or organizer)' })
    @IsIn(['volunteer', 'organizer'])
    role!: 'volunteer' | 'organizer';
}
