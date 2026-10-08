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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { AssignRoleDto } from '../dto/assign-role.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.userService.create(createUserDto);
    }

    @Get()
    async findAll() {
        return await this.userService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const user = await this.userService.findOne(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    @Get(':id/permissions')
    async findOneWithPermissions(@Param('id', ParseIntPipe) id: number) {
        const user = await this.userService.findOneWithPermissions(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    @Get('email/:email')
    async findByEmail(@Param('email') email: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new NotFoundException(`User with email '${email}' not found`);
        }
        return user;
    }

    @Get('username/:username')
    async findByUsername(@Param('username') username: string) {
        const user = await this.userService.findByUsername(username);
        if (!user) {
            throw new NotFoundException(`User with username '${username}' not found`);
        }
        return user;
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
        const updatedUser = await this.userService.update(id, updateUserDto);
        if (!updatedUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return updatedUser;
    }

    @Patch(':id/status')
    async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() updateUserStatusDto: UpdateUserStatusDto) {
        const updatedUser = await this.userService.updateStatus(id, updateUserStatusDto.is_active);
        if (!updatedUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return updatedUser;
    }

    @Patch(':id/role')
    async updateRole(@Param('id', ParseIntPipe) id: number, @Body() assignRoleDto: AssignRoleDto) {
        const updatedUser = await this.userService.updateRole(id, assignRoleDto.role_id);
        if (!updatedUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return updatedUser;
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        const user = await this.userService.findOne(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        await this.userService.remove(id);
    }
}
