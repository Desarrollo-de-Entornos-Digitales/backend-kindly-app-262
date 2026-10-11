import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../users/user/user.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserInactiveException } from '../../common/exceptions';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigService,
        private readonly userService: UserService,
    ) {
        const secret = configService.get<string>('JWT_SECRET') || 'kindly_secret_key_2026';

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.userService.findOneWithPermissions(payload.sub);
        if (!user) {
            throw new UnauthorizedException('User not found or token invalid');
        }

        if (!user.is_active) {
            throw new UserInactiveException('User account is deactivated. Please contact support.');
        }

        const permissions =
            user.role?.rolePermissions?.map((rp) => rp.permission?.name).filter((p): p is string => Boolean(p)) ?? [];

        return {
            ...user,
            role: user.role?.name,
            permissions,
        };
    }
}
