import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { VolunteerCategoryService } from './volunteer-category.service';
import { CreateVolunteerCategoryDto } from './dto/create-volunteer-category.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller(['volunteer-categories', 'volunteer-category'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('volunteer', 'admin')
export class VolunteerCategoryController {
    constructor(private readonly volunteerCategoryService: VolunteerCategoryService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@CurrentUser() user: any, @Body() createVolunteerCategoryDto: CreateVolunteerCategoryDto) {
        return await this.volunteerCategoryService.create(createVolunteerCategoryDto, user?.sub ?? user?.id);
    }

    @Get()
    async findAll(@Query('volunteer_id') volunteerId?: string) {
        const parsedId = volunteerId ? parseInt(volunteerId, 10) : undefined;
        return await this.volunteerCategoryService.findAll(parsedId);
    }

    @Get(':volunteerId/:categoryId')
    async findOne(
        @Param('volunteerId', ParseIntPipe) volunteerId: number,
        @Param('categoryId', ParseIntPipe) categoryId: number,
    ) {
        return await this.volunteerCategoryService.findOne(volunteerId, categoryId);
    }

    @Delete(':volunteerId/:categoryId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('volunteerId', ParseIntPipe) volunteerId: number,
        @Param('categoryId', ParseIntPipe) categoryId: number,
    ) {
        await this.volunteerCategoryService.remove(volunteerId, categoryId);
    }
}
