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
import { OrganizerService } from './organizer.service';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('organizer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class OrganizerController {
    constructor(private readonly organizerService: OrganizerService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createOrganizerDto: CreateOrganizerDto) {
        return await this.organizerService.create(createOrganizerDto);
    }

    @Get()
    async findAll() {
        return await this.organizerService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.organizerService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateOrganizerDto: UpdateOrganizerDto) {
        return await this.organizerService.update(id, updateOrganizerDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.organizerService.remove(id);
    }
}
