import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { CreateAchievementDto } from './achievement/dto/create-achievement.dto';
import { UpdateAchievementDto } from './achievement/dto/update-achievement.dto';
import { QueryAchievementsDto } from './dto/query-achievements.dto';

@Controller('achievements')
export class AchievementsController {
    constructor(private readonly achievementsService: AchievementsService) {}

    @Post()
    create(@Body() createAchievementDto: CreateAchievementDto) {
        return this.achievementsService.create(createAchievementDto);
    }

    @Get()
    findAll(@Query() query: QueryAchievementsDto) {
        return this.achievementsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.achievementsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAchievementDto: UpdateAchievementDto) {
        return this.achievementsService.update(+id, updateAchievementDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.achievementsService.remove(+id);
    }
}
