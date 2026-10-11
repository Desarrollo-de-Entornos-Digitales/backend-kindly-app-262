import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { CreateAchievementDto } from './achievement/dto/create-achievement.dto';
import { UpdateAchievementDto } from './achievement/dto/update-achievement.dto';
import { QueryAchievementsDto } from './dto/query-achievements.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('achievements')
export class AchievementsController {
    constructor(private readonly achievementsService: AchievementsService) {}

    @Get('my-badges')
    @UseGuards(JwtAuthGuard)
    async getMyBadges(@CurrentUser() user: any) {
        const userId = user?.sub ?? user?.id;
        return await this.achievementsService.getVolunteerEarnedBadges(userId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createAchievementDto: CreateAchievementDto) {
        return await this.achievementsService.create(createAchievementDto);
    }

    @Get()
    async findAll(@Query() query: QueryAchievementsDto) {
        return await this.achievementsService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.achievementsService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateAchievementDto: UpdateAchievementDto) {
        return await this.achievementsService.update(id, updateAchievementDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.achievementsService.remove(id);
    }
}
