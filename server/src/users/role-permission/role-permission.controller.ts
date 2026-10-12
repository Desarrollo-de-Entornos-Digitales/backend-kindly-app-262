import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { RolePermissionService } from './role-permission.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('role-permission')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class RolePermissionController {
    constructor(private readonly rolePermissionService: RolePermissionService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createRolePermissionDto: CreateRolePermissionDto) {
        return await this.rolePermissionService.create(createRolePermissionDto);
    }

    @Get()
    async findAll() {
        return await this.rolePermissionService.findAll();
    }

    @Get('role/:roleId')
    async findByRole(@Param('roleId', ParseIntPipe) roleId: number) {
        return await this.rolePermissionService.findByRole(roleId);
    }

    @Delete(':roleId/:permissionId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('roleId', ParseIntPipe) roleId: number,
        @Param('permissionId', ParseIntPipe) permissionId: number,
    ) {
        await this.rolePermissionService.remove(roleId, permissionId);
    }
}
