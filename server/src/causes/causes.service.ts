import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

    update(id: number, _updateCauseDto: UpdateCauseDto) {
        return `This action updates a #${id} cause`;
    }

    remove(id: number) {
        return `This action removes a #${id} cause`;
    }
}
