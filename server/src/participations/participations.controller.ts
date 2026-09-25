import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParticipationsService } from './participations.service';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';

@Controller('participations')
export class ParticipationsController {
  constructor(private readonly participationsService: ParticipationsService) {}

  @Post()
  create(@Body() createParticipationDto: CreateParticipationDto) {
    return this.participationsService.create(createParticipationDto);
  }

  @Get()
  findAll() {
    return this.participationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.participationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParticipationDto: UpdateParticipationDto) {
    return this.participationsService.update(+id, updateParticipationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.participationsService.remove(+id);
  }
}
