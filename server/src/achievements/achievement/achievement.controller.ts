import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('achievement')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AchievementController {
    constructor(private readonly achievementService: AchievementService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createAchievementDto: CreateAchievementDto) {
        return await this.achievementService.create(createAchievementDto);
    }

    @Get()
    async findAll() {
        return await this.achievementService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.achievementService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateAchievementDto: UpdateAchievementDto) {
        return await this.achievementService.update(id, updateAchievementDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.achievementService.remove(id);
    }
}
