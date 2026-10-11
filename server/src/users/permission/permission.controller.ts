import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    NotFoundException,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Controller('permission')
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createPermissionDto: CreatePermissionDto) {
        return await this.permissionService.create(createPermissionDto);
    }

    @Get()
    async findAll() {
        return await this.permissionService.findAll();
    }

    @Get('name/:name')
    async findByName(@Param('name') name: string) {
        const permission = await this.permissionService.findByName(name);
        if (!permission) {
            throw new NotFoundException(`Permission with name '${name}' not found`);
        }
        return permission;
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const permission = await this.permissionService.findOne(id);
        if (!permission) {
            throw new NotFoundException(`Permission with ID ${id} not found`);
        }
        return permission;
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updatePermissionDto: UpdatePermissionDto) {
        const updatedPermission = await this.permissionService.update(id, updatePermissionDto);
        if (!updatedPermission) {
            throw new NotFoundException(`Permission with ID ${id} not found`);
        }
        return updatedPermission;
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        const permission = await this.permissionService.findOne(id);
        if (!permission) {
            throw new NotFoundException(`Permission with ID ${id} not found`);
        }
        await this.permissionService.remove(id);
    }
}
