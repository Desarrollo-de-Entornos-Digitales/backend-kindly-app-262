import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VolunteerCategoryService } from './volunteer-category.service';
import { CreateVolunteerCategoryDto } from './dto/create-volunteer-category.dto';
import { UpdateVolunteerCategoryDto } from './dto/update-volunteer-category.dto';

@Controller('volunteer-category')
export class VolunteerCategoryController {
    constructor(private readonly volunteerCategoryService: VolunteerCategoryService) {}

    @Post()
    create(@Body() createVolunteerCategoryDto: CreateVolunteerCategoryDto) {
        return this.volunteerCategoryService.create(createVolunteerCategoryDto);
    }

    @Get()
    findAll() {
        return this.volunteerCategoryService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.volunteerCategoryService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateVolunteerCategoryDto: UpdateVolunteerCategoryDto) {
        return this.volunteerCategoryService.update(+id, updateVolunteerCategoryDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.volunteerCategoryService.remove(+id);
    }
}
