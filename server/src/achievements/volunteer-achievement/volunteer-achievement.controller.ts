import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VolunteerAchievementService } from './volunteer-achievement.service';
import { CreateVolunteerAchievementDto } from './dto/create-volunteer-achievement.dto';
import { UpdateVolunteerAchievementDto } from './dto/update-volunteer-achievement.dto';

@Controller('volunteer-achievement')
export class VolunteerAchievementController {
  constructor(private readonly volunteerAchievementService: VolunteerAchievementService) {}

  @Post()
  create(@Body() createVolunteerAchievementDto: CreateVolunteerAchievementDto) {
    return this.volunteerAchievementService.create(createVolunteerAchievementDto);
  }

  @Get()
  findAll() {
    return this.volunteerAchievementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.volunteerAchievementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVolunteerAchievementDto: UpdateVolunteerAchievementDto) {
    return this.volunteerAchievementService.update(+id, updateVolunteerAchievementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.volunteerAchievementService.remove(+id);
  }
}
