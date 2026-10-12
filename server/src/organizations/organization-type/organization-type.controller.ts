import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { OrganizationTypeService } from './organization-type.service';
import { CreateOrganizationTypeDto } from './dto/create-organization-type.dto';
import { UpdateOrganizationTypeDto } from './dto/update-organization-type.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('organization-type')
export class OrganizationTypeController {
    constructor(private readonly organizationTypeService: OrganizationTypeService) {}

    @Get()
    async findAll() {
        return await this.organizationTypeService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.organizationTypeService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createOrganizationTypeDto: CreateOrganizationTypeDto) {
        return await this.organizationTypeService.create(createOrganizationTypeDto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateOrganizationTypeDto: UpdateOrganizationTypeDto) {
        return await this.organizationTypeService.update(id, updateOrganizationTypeDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.organizationTypeService.remove(id);
    }
}
