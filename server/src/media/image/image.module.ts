import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { Image } from '../entities/image.entity';
import { Cause } from '../../causes/entities/cause.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Image, Cause])],
    controllers: [ImageController],
    providers: [ImageService],
    exports: [ImageService],
})
export class ImageModule {}
