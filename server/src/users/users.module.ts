import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';

import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { RolePermissionModule } from './role-permission/role-permission.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Role, Permission, RolePermission]),
        UserModule,
        RoleModule,
        PermissionModule,
        RolePermissionModule,
        AuthModule,
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService, UserModule, RoleModule, PermissionModule, RolePermissionModule],
})
export class UsersModule {}
