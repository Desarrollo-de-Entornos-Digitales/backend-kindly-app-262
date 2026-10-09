import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import { CreateVolunteerDto } from './volunteer/dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './volunteer/dto/update-volunteer.dto';
import { QueryVolunteersDto } from './dto/query-volunteers.dto';

@Controller('volunteers')
export class VolunteersController {
    constructor(private readonly volunteersService: VolunteersService) {}

    @Post()
    create(@Body() createVolunteerDto: CreateVolunteerDto) {
        return this.volunteersService.create(createVolunteerDto);
    }

    @Get()
    findAll(@Query() query: QueryVolunteersDto) {
        return this.volunteersService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.volunteersService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateVolunteerDto: UpdateVolunteerDto) {
        return this.volunteersService.update(+id, updateVolunteerDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.volunteersService.remove(+id);
    }
}
