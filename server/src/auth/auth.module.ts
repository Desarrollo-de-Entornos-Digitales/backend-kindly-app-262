import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt-strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permission.guard';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { UserModule } from '../users/user/user.module';
import { RoleModule } from '../users/role/role.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Role]),
        UserModule,
        RoleModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'kindly_secret_key_2026',
            signOptions: {
                expiresIn: (process.env.JWT_EXPIRES_IN ?? '1h') as any,
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard, PermissionsGuard],
    exports: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard, PermissionsGuard, JwtModule, PassportModule],
})
export class AuthModule {}
