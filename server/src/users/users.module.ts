import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { RolePermissionModule } from './role-permission/role-permission.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [UserModule, RoleModule, PermissionModule, RolePermissionModule],
})
export class UsersModule {}
