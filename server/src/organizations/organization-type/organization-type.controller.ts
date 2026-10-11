import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { OrganizationTypeService } from './organization-type.service';
import { CreateOrganizationTypeDto } from './dto/create-organization-type.dto';
import { UpdateOrganizationTypeDto } from './dto/update-organization-type.dto';

@Controller('organization-type')
export class OrganizationTypeController {
    constructor(private readonly organizationTypeService: OrganizationTypeService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createOrganizationTypeDto: CreateOrganizationTypeDto) {
        return await this.organizationTypeService.create(createOrganizationTypeDto);
    }

    @Get()
    async findAll() {
        return await this.organizationTypeService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.organizationTypeService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateOrganizationTypeDto: UpdateOrganizationTypeDto) {
        return await this.organizationTypeService.update(id, updateOrganizationTypeDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.organizationTypeService.remove(id);
    }
}
