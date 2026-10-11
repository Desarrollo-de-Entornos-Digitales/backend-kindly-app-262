import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { VolunteerService } from './volunteer.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';

@Controller('volunteer')
export class VolunteerController {
    constructor(private readonly volunteerService: VolunteerService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createVolunteerDto: CreateVolunteerDto) {
        return await this.volunteerService.create(createVolunteerDto);
    }

    @Get()
    async findAll() {
        return await this.volunteerService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.volunteerService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateVolunteerDto: UpdateVolunteerDto) {
        return await this.volunteerService.update(id, updateVolunteerDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.volunteerService.remove(id);
    }
}
