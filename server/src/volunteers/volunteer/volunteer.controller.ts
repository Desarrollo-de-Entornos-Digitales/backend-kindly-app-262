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
import { VolunteerService } from './volunteer.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('volunteer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class VolunteerController {
    constructor(private readonly volunteerService: VolunteerService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createVolunteerDto: CreateVolunteerDto) {
        return await this.volunteerService.create(createVolunteerDto);
    }

    @Get()
    async findAll() {
        return await this.volunteerService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.volunteerService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateVolunteerDto: UpdateVolunteerDto) {
        return await this.volunteerService.update(id, updateVolunteerDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.volunteerService.remove(id);
    }
}
