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
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('volunteers')
export class VolunteersController {
    constructor(private readonly volunteersService: VolunteersService) {}

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMyProfile(@CurrentUser() user: any) {
        const userId = user?.sub ?? user?.id;
        return await this.volunteersService.findByUserId(userId);
    }

    @Patch('me')
    @UseGuards(JwtAuthGuard)
    async updateMyProfile(@CurrentUser() user: any, @Body() updateVolunteerDto: UpdateVolunteerDto) {
        const userId = user?.sub ?? user?.id;
        return await this.volunteersService.updateByUserId(userId, updateVolunteerDto);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createVolunteerDto: CreateVolunteerDto) {
        return await this.volunteersService.create(createVolunteerDto);
    }

    @Get()
    async findAll(@Query() query: QueryVolunteersDto) {
        return await this.volunteersService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.volunteersService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateVolunteerDto: UpdateVolunteerDto) {
        return await this.volunteersService.update(id, updateVolunteerDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.volunteersService.remove(id);
    }
}
