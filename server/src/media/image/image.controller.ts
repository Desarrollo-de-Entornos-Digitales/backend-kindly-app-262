import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ImageService } from './image.service';
import { CreateImageDto } from './dto/create-image.dto';
import { PositiveIntPipe } from '../../common/pipes/positive-int.pipe';

@Controller('causes/:causeId/images')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Param('causeId', PositiveIntPipe) causeId: number, @Body() createImageDto: CreateImageDto) {
        return this.imageService.create(causeId, createImageDto);
    }

    @Get()
    findAll(@Param('causeId', PositiveIntPipe) causeId: number) {
        return this.imageService.findAllByCause(causeId);
    }

    @Delete(':imageId')
    remove(@Param('causeId', PositiveIntPipe) causeId: number, @Param('imageId', PositiveIntPipe) imageId: number) {
        return this.imageService.remove(causeId, imageId);
    }
}
