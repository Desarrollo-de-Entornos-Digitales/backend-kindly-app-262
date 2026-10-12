import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { VolunteerSkillService } from './volunteer-skill.service';
import { CreateVolunteerSkillDto } from './dto/create-volunteer-skill.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('volunteer-skill')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('volunteer', 'admin')
export class VolunteerSkillController {
    constructor(private readonly volunteerSkillService: VolunteerSkillService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createVolunteerSkillDto: CreateVolunteerSkillDto) {
        return await this.volunteerSkillService.create(createVolunteerSkillDto);
    }

    @Get()
    async findAll(@Query('volunteer_id') volunteerId?: string) {
        const parsedId = volunteerId ? parseInt(volunteerId, 10) : undefined;
        return await this.volunteerSkillService.findAll(parsedId);
    }

    @Get(':volunteerId/:skillId')
    async findOne(
        @Param('volunteerId', ParseIntPipe) volunteerId: number,
        @Param('skillId', ParseIntPipe) skillId: number,
    ) {
        return await this.volunteerSkillService.findOne(volunteerId, skillId);
    }

    @Delete(':volunteerId/:skillId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('volunteerId', ParseIntPipe) volunteerId: number,
        @Param('skillId', ParseIntPipe) skillId: number,
    ) {
        await this.volunteerSkillService.remove(volunteerId, skillId);
    }
}
