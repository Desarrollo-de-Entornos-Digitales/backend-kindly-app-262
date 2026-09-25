import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VolunteerSkillService } from './volunteer-skill.service';
import { CreateVolunteerSkillDto } from './dto/create-volunteer-skill.dto';
import { UpdateVolunteerSkillDto } from './dto/update-volunteer-skill.dto';

@Controller('volunteer-skill')
export class VolunteerSkillController {
  constructor(private readonly volunteerSkillService: VolunteerSkillService) {}

  @Post()
  create(@Body() createVolunteerSkillDto: CreateVolunteerSkillDto) {
    return this.volunteerSkillService.create(createVolunteerSkillDto);
  }

  @Get()
  findAll() {
    return this.volunteerSkillService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.volunteerSkillService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVolunteerSkillDto: UpdateVolunteerSkillDto) {
    return this.volunteerSkillService.update(+id, updateVolunteerSkillDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.volunteerSkillService.remove(+id);
  }
}
