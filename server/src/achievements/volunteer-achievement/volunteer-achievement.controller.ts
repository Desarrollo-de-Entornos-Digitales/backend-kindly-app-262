import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { VolunteerAchievementService } from './volunteer-achievement.service';
import { CreateVolunteerAchievementDto } from './dto/create-volunteer-achievement.dto';

@Controller('volunteer-achievement')
export class VolunteerAchievementController {
    constructor(private readonly volunteerAchievementService: VolunteerAchievementService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createVolunteerAchievementDto: CreateVolunteerAchievementDto) {
        return await this.volunteerAchievementService.create(createVolunteerAchievementDto);
    }

    @Get()
    async findAll() {
        return await this.volunteerAchievementService.findAll();
    }

    @Get('volunteer/:volunteerId')
    async findByVolunteer(@Param('volunteerId', ParseIntPipe) volunteerId: number) {
        return await this.volunteerAchievementService.findByVolunteer(volunteerId);
    }

    @Get('achievement/:achievementId')
    async findByAchievement(@Param('achievementId', ParseIntPipe) achievementId: number) {
        return await this.volunteerAchievementService.findByAchievement(achievementId);
    }

    @Get(':volunteerId/:achievementId')
    async findOne(
        @Param('volunteerId', ParseIntPipe) volunteerId: number,
        @Param('achievementId', ParseIntPipe) achievementId: number,
    ) {
        return await this.volunteerAchievementService.findOne(volunteerId, achievementId);
    }

    @Delete(':volunteerId/:achievementId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('volunteerId', ParseIntPipe) volunteerId: number,
        @Param('achievementId', ParseIntPipe) achievementId: number,
    ) {
        await this.volunteerAchievementService.remove(volunteerId, achievementId);
    }
}
