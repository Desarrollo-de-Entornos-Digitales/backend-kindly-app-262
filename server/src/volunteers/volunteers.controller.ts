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
import { VolunteersService } from './volunteers.service';
import { CreateVolunteerDto } from './volunteer/dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './volunteer/dto/update-volunteer.dto';
import { QueryVolunteersDto } from './dto/query-volunteers.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('volunteers')
export class VolunteersController {
    constructor(private readonly volunteersService: VolunteersService) {}

    @Get('me')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('volunteer')
    async getMyProfile(@CurrentUser() user: any) {
        const userId = user?.sub ?? user?.id;
        return await this.volunteersService.findByUserId(userId);
    }

    @Patch('me')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('volunteer')
    async updateMyProfile(@CurrentUser() user: any, @Body() updateVolunteerDto: UpdateVolunteerDto) {
        const userId = user?.sub ?? user?.id;
        return await this.volunteersService.updateByUserId(userId, updateVolunteerDto);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('volunteer')
    @HttpCode(HttpStatus.CREATED)
    async create(@CurrentUser() user: any, @Body() createVolunteerDto: CreateVolunteerDto) {
        createVolunteerDto.user_id = user?.sub ?? user?.id ?? createVolunteerDto.user_id;
        return await this.volunteersService.create(createVolunteerDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'organizer')
    async findAll(@Query() query: QueryVolunteersDto) {
        return await this.volunteersService.findAll(query);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'organizer', 'volunteer')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.volunteersService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateVolunteerDto: UpdateVolunteerDto) {
        return await this.volunteersService.update(id, updateVolunteerDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.volunteersService.remove(id);
    }
}
