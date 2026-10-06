import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCauseDto } from './dto/create-cause.dto';
import { UpdateCauseDto } from './dto/update-cause.dto';
import { Cause } from './entities/cause.entity';
import { Organizer } from '../organizations/entities/organizer.entity';
import { Category } from '../volunteers/entities/category.entity';
import {
    OrganizerNotFoundException,
    OrganizationNotVerifiedException,
    CauseNotFoundException,
} from '../common/exceptions';

@Injectable()
export class CausesService {
    constructor(
        @InjectRepository(Cause)
        private readonly causeRepository: Repository<Cause>,
        @InjectRepository(Organizer)
        private readonly organizerRepository: Repository<Organizer>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) {}

    async create(createCauseDto: CreateCauseDto): Promise<Cause> {
        // 1. Validar fechas: la fecha de fin no puede ser anterior a la de inicio
        const startDate = new Date(createCauseDto.start_date);
        const endDate = new Date(createCauseDto.end_date);

        if (endDate < startDate) {
            throw new BadRequestException('End date cannot be earlier than start date.');
        }

        // 2. Validar Organizer
        const organizer = await this.organizerRepository.findOne({
            where: { id: createCauseDto.organizer_id },
        });

        if (!organizer) {
            throw new OrganizerNotFoundException(createCauseDto.organizer_id);
        }

        if (organizer.verification_status?.toLowerCase() !== 'verified') {
            throw new OrganizationNotVerifiedException();
        }

        // 3. Validar Category
        const category = await this.categoryRepository.findOne({
            where: { id: createCauseDto.category_id },
        });

        if (!category) {
            throw new NotFoundException(`Category with ID '${createCauseDto.category_id}' not found.`);
        }

        // 4. Crear y guardar Cause
        const cause = this.causeRepository.create({
            ...createCauseDto,
            organizer,
            category,
            is_available: false,
            progress: 'open',
            qr_code: `QR-CAUSE-${Date.now()}`,
        });

        return await this.causeRepository.save(cause);
    }

    async publish(causeId: number): Promise<Cause> {
        const cause = await this.causeRepository.findOne({
            where: { id: causeId },
        });

        if (!cause) {
            throw new CauseNotFoundException(causeId);
        }

        cause.is_available = true;
        cause.progress = 'open';

        return await this.causeRepository.save(cause);
    }

    async findMyCauses(organizerId: number): Promise<Cause[]> {
        const organizer = await this.organizerRepository.findOne({
            where: { id: organizerId },
        });

        if (!organizer) {
            throw new OrganizerNotFoundException(organizerId);
        }

        return await this.causeRepository.find({
            where: { organizer_id: organizerId },
        });
    }

    findAll() {
        return `This action returns all causes`;
    }

    findOne(id: number) {
        return `This action returns a #${id} cause`;
    }

    async update(causeId: number, organizerId: number, updateCauseDto: UpdateCauseDto): Promise<Cause> {
        // 1. Validar existencia de la causa
        const cause = await this.causeRepository.findOne({
            where: { id: causeId },
        });

        if (!cause) {
            throw new CauseNotFoundException(causeId);
        }

        // 2. Validar existencia del organizer
        const organizer = await this.organizerRepository.findOne({
            where: { id: organizerId },
        });

        if (!organizer) {
            throw new OrganizerNotFoundException(organizerId);
        }

        // 3. Validar pertenencia: la causa debe pertenecer al organizer solicitante
        if (cause.organizer_id !== organizerId) {
            throw new ForbiddenException(
                `Cause with ID '${causeId}' does not belong to organizer with ID '${organizerId}'.`,
            );
        }

        // 4. Si se actualizan fechas, validar que end_date no sea anterior a start_date
        const effectiveStartDate = updateCauseDto.start_date
            ? new Date(updateCauseDto.start_date)
            : new Date(cause.start_date);

        const effectiveEndDate = updateCauseDto.end_date ? new Date(updateCauseDto.end_date) : new Date(cause.end_date);

        if (effectiveEndDate < effectiveStartDate) {
            throw new BadRequestException('End date cannot be earlier than start date.');
        }

        // 5. Si se actualiza category_id, validar que la categoría exista
        if (updateCauseDto.category_id !== undefined) {
            const category = await this.categoryRepository.findOne({
                where: { id: updateCauseDto.category_id },
            });

            if (!category) {
                throw new NotFoundException(`Category with ID '${updateCauseDto.category_id}' not found.`);
            }

            cause.category = category;
            cause.category_id = updateCauseDto.category_id;
        }

        // 6. Actualizar únicamente campos permitidos de la información de la causa
        if (updateCauseDto.title !== undefined) cause.title = updateCauseDto.title;
        if (updateCauseDto.cover_image_url !== undefined) cause.cover_image_url = updateCauseDto.cover_image_url;
        if (updateCauseDto.description !== undefined) cause.description = updateCauseDto.description;
        if (updateCauseDto.capacity !== undefined) cause.capacity = updateCauseDto.capacity;
        if (updateCauseDto.address !== undefined) cause.address = updateCauseDto.address;
        if (updateCauseDto.location_latitude !== undefined) cause.location_latitude = updateCauseDto.location_latitude;
        if (updateCauseDto.location_longitude !== undefined)
            cause.location_longitude = updateCauseDto.location_longitude;
        if (updateCauseDto.start_date !== undefined) cause.start_date = new Date(updateCauseDto.start_date);
        if (updateCauseDto.end_date !== undefined) cause.end_date = new Date(updateCauseDto.end_date);

        // Campos protegidos que NUNCA se alteran en esta historia:
        // cause.id, cause.organizer_id, cause.created_at, cause.qr_code, cause.is_available, cause.progress

        return await this.causeRepository.save(cause);
    }

    remove(id: number) {
        return `This action removes a #${id} cause`;
    }
}
