import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CausesService } from './causes.service';
import { CreateCauseDto } from './dto/create-cause.dto';
import { UpdateCauseDto } from './dto/update-cause.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { PositiveIntPipe } from '../common/pipes/positive-int.pipe';

@Controller('causes')
export class CausesController {
    constructor(private readonly causesService: CausesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createCauseDto: CreateCauseDto) {
        return this.causesService.create(createCauseDto);
    }

    @Get()
    findAll() {
        return this.causesService.findAll();
    }

    @Get('my-causes')
    findMyCauses(@Query('organizer_id', PositiveIntPipe) organizerId: number) {
        return this.causesService.findMyCauses(organizerId);
    }

    @Get('organizer/:organizerId')
    findByOrganizer(@Param('organizerId', PositiveIntPipe) organizerId: number) {
        return this.causesService.findMyCauses(organizerId);
    }

    @Get(':id/capacity')
    getCapacity(@Param('id', PositiveIntPipe) id: number, @Query('organizer_id', PositiveIntPipe) organizerId: number) {
        return this.causesService.getCapacity(id, organizerId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.causesService.findOne(+id);
    }

    @Patch(':causeId/publish')
    @HttpCode(HttpStatus.OK)
    publish(@Param('causeId', PositiveIntPipe) causeId: number) {
        return this.causesService.publish(causeId);
    }

    @Patch(':id/availability')
    updateAvailability(
        @Param('id', PositiveIntPipe) id: number,
        @Query('organizer_id', PositiveIntPipe) organizerId: number,
        @Body() updateAvailabilityDto: UpdateAvailabilityDto,
    ) {
        return this.causesService.updateAvailability(id, organizerId, updateAvailabilityDto);
    }

    @Patch(':id')
    update(
        @Param('id', PositiveIntPipe) id: number,
        @Query('organizer_id', PositiveIntPipe) organizerId: number,
        @Body() updateCauseDto: UpdateCauseDto,
    ) {
        return this.causesService.update(id, organizerId, updateCauseDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.causesService.remove(+id);
    }
}
