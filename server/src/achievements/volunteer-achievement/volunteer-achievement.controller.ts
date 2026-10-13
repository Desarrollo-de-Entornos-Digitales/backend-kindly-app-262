import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { VolunteerAchievementService } from './volunteer-achievement.service';
import { CreateVolunteerAchievementDto } from './dto/create-volunteer-achievement.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller(['volunteer-achievements', 'volunteer-achievement'])
export class VolunteerAchievementController {
    constructor(private readonly volunteerAchievementService: VolunteerAchievementService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'organizer')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createVolunteerAchievementDto: CreateVolunteerAchievementDto) {
        return await this.volunteerAchievementService.create(createVolunteerAchievementDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll() {
        return await this.volunteerAchievementService.findAll();
    }

    @Get('volunteer/:volunteerId')
    @UseGuards(JwtAuthGuard)
    async findByVolunteer(@Param('volunteerId', ParseIntPipe) volunteerId: number) {
        return await this.volunteerAchievementService.findByVolunteer(volunteerId);
    }

    @Get('achievement/:achievementId')
    @UseGuards(JwtAuthGuard)
    async findByAchievement(@Param('achievementId', ParseIntPipe) achievementId: number) {
        return await this.volunteerAchievementService.findByAchievement(achievementId);
    }

    @Get(':volunteerId/:achievementId')
    @UseGuards(JwtAuthGuard)
    async findOne(
        @Param('volunteerId', ParseIntPipe) volunteerId: number,
        @Param('achievementId', ParseIntPipe) achievementId: number,
    ) {
        return await this.volunteerAchievementService.findOne(volunteerId, achievementId);
    }

    @Delete(':volunteerId/:achievementId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('volunteerId', ParseIntPipe) volunteerId: number,
        @Param('achievementId', ParseIntPipe) achievementId: number,
    ) {
        await this.volunteerAchievementService.remove(volunteerId, achievementId);
    }
}
