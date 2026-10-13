import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateImageDto } from './dto/create-image.dto';
import { Image } from '../entities/image.entity';
import { Cause } from '../../causes/entities/cause.entity';
import { Organizer } from '../../organizations/entities/organizer.entity';
import { CauseNotFoundException, OrganizerNotFoundException } from '../../common/exceptions';

@Injectable()
export class ImageService {
    constructor(
        @InjectRepository(Image)
        private readonly imageRepository: Repository<Image>,
        @InjectRepository(Cause)
        private readonly causeRepository: Repository<Cause>,
        @InjectRepository(Organizer)
        private readonly organizerRepository: Repository<Organizer>,
    ) {}

    private async validateCauseOwnership(causeId: number, organizerId: number): Promise<Cause> {
        // 1. Validar existencia del organizador
        const organizer = await this.organizerRepository.findOne({
            where: { id: organizerId },
        });

        if (!organizer) {
            throw new OrganizerNotFoundException(organizerId);
        }

        // 2. Validar existencia de la causa
        const cause = await this.causeRepository.findOne({
            where: { id: causeId },
        });

        if (!cause) {
            throw new CauseNotFoundException(causeId);
        }

        // 3. Validar pertenencia: la causa debe pertenecer al organizer solicitante
        if (cause.organizer_id !== organizerId) {
            throw new ForbiddenException(
                `Cause with ID '${causeId}' does not belong to organizer with ID '${organizerId}'.`,
            );
        }

        return cause;
    }

    async create(causeId: number, organizerId: number, createImageDto: CreateImageDto): Promise<Image> {
        const cause = await this.validateCauseOwnership(causeId, organizerId);

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

    async remove(causeId: number, imageId: number, organizerId: number): Promise<{ message: string }> {
        await this.validateCauseOwnership(causeId, organizerId);

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
