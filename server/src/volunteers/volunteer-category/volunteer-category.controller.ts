import { Controller, Get, Post, Body, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { VolunteerCategoryService } from './volunteer-category.service';
import { CreateVolunteerCategoryDto } from './dto/create-volunteer-category.dto';

@Controller(['volunteer-categories', 'volunteer-category'])
export class VolunteerCategoryController {
    constructor(private readonly volunteerCategoryService: VolunteerCategoryService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createVolunteerCategoryDto: CreateVolunteerCategoryDto) {
        return await this.volunteerCategoryService.create(createVolunteerCategoryDto);
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
