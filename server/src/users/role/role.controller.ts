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
    UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('role')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createRoleDto: CreateRoleDto) {
        return await this.roleService.create(createRoleDto);
    }

    @Get()
    async findAll() {
        return await this.roleService.findAll();
    }

    @Get('name/:name')
    async findByName(@Param('name') name: string) {
        const role = await this.roleService.findByName(name);
        if (!role) {
            throw new NotFoundException(`Role with name '${name}' not found`);
        }
        return role;
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const role = await this.roleService.findOne(id);
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
        const updatedRole = await this.roleService.update(id, updateRoleDto);
        if (!updatedRole) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return updatedRole;
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        const role = await this.roleService.findOne(id);
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        await this.roleService.remove(id);
    }
}
