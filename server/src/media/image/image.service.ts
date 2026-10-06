import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateImageDto } from './dto/create-image.dto';
import { Image } from '../entities/image.entity';
import { Cause } from '../../causes/entities/cause.entity';
import { CauseNotFoundException } from '../../common/exceptions';

@Injectable()
export class ImageService {
    constructor(
        @InjectRepository(Image)
        private readonly imageRepository: Repository<Image>,
        @InjectRepository(Cause)
        private readonly causeRepository: Repository<Cause>,
    ) {}

    async create(causeId: number, createImageDto: CreateImageDto): Promise<Image> {
        const cause = await this.causeRepository.findOne({
            where: { id: causeId },
        });

        if (!cause) {
            throw new CauseNotFoundException(causeId);
        }

        const image = this.imageRepository.create({
            ...createImageDto,
            cause_id: causeId,
            cause,
        });

        return await this.imageRepository.save(image);
    }

    async findAllByCause(causeId: number): Promise<Image[]> {
        const cause = await this.causeRepository.findOne({
            where: { id: causeId },
        });

        if (!cause) {
            throw new CauseNotFoundException(causeId);
        }

        return await this.imageRepository.find({
            where: { cause_id: causeId },
        });
    }

    async remove(causeId: number, imageId: number): Promise<{ message: string }> {
        const cause = await this.causeRepository.findOne({
            where: { id: causeId },
        });

        if (!cause) {
            throw new CauseNotFoundException(causeId);
        }

        const image = await this.imageRepository.findOne({
            where: { id: imageId },
        });

        if (!image) {
            throw new NotFoundException(`Image with ID '${imageId}' not found.`);
        }

        if (image.cause_id !== causeId) {
            throw new BadRequestException(`Image with ID '${imageId}' does not belong to cause with ID '${causeId}'.`);
        }

        await this.imageRepository.delete(imageId);

        return {
            message: `Image with identifier '${imageId}' removed successfully.`,
        };
    }
}
