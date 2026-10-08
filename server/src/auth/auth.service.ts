import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user/user.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { use } from 'passport';
import { access } from 'fs';

@Injectable()
export class AuthService {
    constructor(
        private readonly jtwService: JwtService,
        private readonly userService: UserService,
    ) {}

    async validateUser(email: string, password: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new BadRequestException('The user was not found');
        }

        const MatchedUser = await bcrypt.compare(password, user.passwordHash);
        if (!MatchedUser) {
            throw new BadRequestException('Invalid user credentials')
        }

        return user;
    }


    async Login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            permissions,
        };

        return {
            message: ''
            access_token: this.jtwService.sign(payload),
            token_type: 'Bearer',
            user: {
                id: user.id,
                email: user.email,
                role: user.role.name,
            },
        };
    }


    create(_createAuthDto: CreateAuthDto) {
        return 'This action adds a new auth';
    }

    findAll() {
        return `This action returns all auth`;
    }

    findOne(id: number) {
        return `This action returns a #${id} auth`;
    }

    update(id: number, _updateAuthDto: UpdateAuthDto) {
        return `This action updates a #${id} auth`;
    }

    remove(id: number) {
        return `This action removes a #${id} auth`;
    }
}
