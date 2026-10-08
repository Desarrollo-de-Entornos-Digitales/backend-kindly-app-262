import { Controller, Get, Patch, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async findAll(@Query() query: QueryUsersDto) {
        return await this.usersService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.usersService.findOne(id);
    }

    @Patch(':id/status')
    async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() updateUserStatusDto: UpdateUserStatusDto) {
        return await this.usersService.updateStatus(id, updateUserStatusDto);
    }

    @Patch(':id/role')
    async assignRole(@Param('id', ParseIntPipe) id: number, @Body() assignRoleDto: AssignRoleDto) {
        return await this.usersService.assignRole(id, assignRoleDto);
    }
}
