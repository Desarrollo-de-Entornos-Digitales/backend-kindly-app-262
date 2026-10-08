import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserService } from '../users/user/user.service';
import { RoleService } from '../users/role/role.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';
import {
    InvalidCredentialsException,
    UserAlreadyExistsException,
    UserInactiveException,
} from '../common/exceptions';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly roleService: RoleService,
    ) {}

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new InvalidCredentialsException('Invalid user credentials');
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            throw new InvalidCredentialsException('Invalid user credentials');
        }

        if (!user.is_active) {
            throw new UserInactiveException('User account is deactivated. Please contact support.');
        }

        return user;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            role: user.role?.name ?? 'volunteer',
        };

        return {
            message: 'User logged in successfully',
            access_token: this.jwtService.sign(payload),
            token_type: 'Bearer',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role?.name,
            },
        };
    }

    async register(registerDto: RegisterDto) {
        if (registerDto.role !== 'volunteer' && registerDto.role !== 'organizer') {
            throw new BadRequestException('Role must be either volunteer or organizer');
        }

        const existingUser = await this.userService.findByEmailOrUsername(
            registerDto.email,
            registerDto.username,
        );
        if (existingUser) {
            throw new UserAlreadyExistsException('A user with this email or username already exists');
        }

        const role = await this.roleService.findByName(registerDto.role);
        if (!role) {
            throw new BadRequestException(`Role ${registerDto.role} not found`);
        }

        const createdUser = await this.userService.create({
            name: registerDto.name,
            username: registerDto.username,
            email: registerDto.email,
            contact: registerDto.contact,
            passwordHash: registerDto.password,
            roleId: role.id,
            is_active: true,
        });

        const payload: JwtPayload = {
            sub: createdUser.id,
            email: createdUser.email,
            username: createdUser.username,
            role: role.name,
        };

        return {
            message: 'User registered successfully',
            access_token: this.jwtService.sign(payload),
            token_type: 'Bearer',
            user: {
                id: createdUser.id,
                name: createdUser.name,
                email: createdUser.email,
                username: createdUser.username,
                role: role.name,
            },
        };
    }
}
