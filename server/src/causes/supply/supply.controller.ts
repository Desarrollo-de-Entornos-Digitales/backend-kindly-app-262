import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { SupplyService } from './supply.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { PositiveIntPipe } from '../../common/pipes/positive-int.pipe';

@Controller('causes/:causeId/supplies')
export class SupplyController {
    constructor(private readonly supplyService: SupplyService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(
        @Param('causeId', PositiveIntPipe) causeId: number,
        @Query('organizer_id', PositiveIntPipe) organizerId: number,
        @Body() createSupplyDto: CreateSupplyDto,
    ) {
        return this.supplyService.create(causeId, organizerId, createSupplyDto);
    }

    @Get()
    findAll(@Param('causeId', PositiveIntPipe) causeId: number) {
        return this.supplyService.findAllByCause(causeId);
    }

    @Patch(':supplyId')
    update(
        @Param('causeId', PositiveIntPipe) causeId: number,
        @Param('supplyId', PositiveIntPipe) supplyId: number,
        @Query('organizer_id', PositiveIntPipe) organizerId: number,
        @Body() updateSupplyDto: UpdateSupplyDto,
    ) {
        return this.supplyService.update(causeId, supplyId, organizerId, updateSupplyDto);
    }

    @Delete(':supplyId')
    remove(
        @Param('causeId', PositiveIntPipe) causeId: number,
        @Param('supplyId', PositiveIntPipe) supplyId: number,
        @Query('organizer_id', PositiveIntPipe) organizerId: number,
    ) {
        return this.supplyService.remove(causeId, supplyId, organizerId);
    }
}
