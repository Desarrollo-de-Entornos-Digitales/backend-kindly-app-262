import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
        TypeOrmModule.forFeature([User, Role]), // Access to our database
        UserModule,
        RoleModule,
        PassportModule.register({ defaultStrategy: 'jwt' }), // jwt method
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'kindly_secret_key_2026',
                signOptions: {
                    expiresIn: (configService.get<string | number>('JWT_EXPIRES_IN') ?? '1h') as any,
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard, PermissionsGuard],
    exports: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard, PermissionsGuard, JwtModule, PassportModule],
})
export class AuthModule {}
