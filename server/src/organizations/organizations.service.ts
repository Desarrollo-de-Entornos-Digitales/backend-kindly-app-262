import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organizer } from './entities/organizer.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { QueryOrganizationsDto } from './dto/query-organizations.dto';
import { OrganizerNotFoundException } from '../common/exceptions';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organizer)
        private readonly organizerRepository: Repository<Organizer>,
    ) {}

    async create(userId: number, dto: CreateOrganizationDto): Promise<Organizer> {
        const existing = await this.organizerRepository.findOneBy({ user_id: userId });
        if (existing) {
            throw new ConflictException(`Organization profile already exists for user '${userId}'`);
        }

        const isOrg = dto.is_organization === true;

        const organizer = this.organizerRepository.create({
            ...dto,
            user_id: userId,
            verification_status: isOrg ? 'pending' : 'verified',
            verification_file: isOrg ? dto.verification_file : null,
            website: isOrg ? dto.website : null,
        });

        const saved = await this.organizerRepository.save(organizer);
        return await this.findOne(saved.id);
    }

    async findByUserId(userId: number): Promise<Organizer> {
        const organizer = await this.organizerRepository.findOne({
            where: { user_id: userId },
            relations: ['user', 'organizationType'],
        });

        if (!organizer) {
            throw new OrganizerNotFoundException(undefined, `No organization profile found for user '${userId}'.`);
        }

        return this.sanitize(organizer);
    }

    async updateByUserId(userId: number, dto: UpdateOrganizationDto): Promise<Organizer> {
        const organizer = await this.findByUserId(userId);

        Object.assign(organizer, dto);

        if (organizer.is_organization === false) {
            organizer.verification_file = null;
        }

        const saved = await this.organizerRepository.save(organizer);
        return this.sanitize(saved);
    }

    async submitVerification(userId: number, dto: SubmitVerificationDto) {
        const organizer = await this.findByUserId(userId);

        if (!organizer.is_organization) {
            throw new BadRequestException(
                'Independent organizers (natural persons) do not require legal verification documents.',
            );
        }

        organizer.verification_file = dto.verification_file;
        organizer.verification_status = 'pending';
        await this.organizerRepository.save(organizer);

        return {
            message: 'Verification document submitted successfully.',
            verification_status: organizer.verification_status,
            verification_file: organizer.verification_file,
        };
    }

    async getVerificationStatus(userId: number) {
        const organizer = await this.findByUserId(userId);

        return {
            organizer_id: organizer.id,
            name: organizer.name,
            is_organization: organizer.is_organization,
            verification_status: organizer.verification_status,
            verification_file: organizer.verification_file,
            is_verified: organizer.verification_status === 'verified',
        };
    }

    async findPendingVerifications(): Promise<Organizer[]> {
        const pending = await this.organizerRepository.find({
            where: { verification_status: 'pending' },
            relations: ['user', 'organizationType'],
            order: { id: 'ASC' },
        });

        return pending.map((org) => this.sanitize(org));
    }

    async reviewVerification(id: number, dto: ReviewVerificationDto) {
        const organizer = await this.findOne(id);

        organizer.verification_status = dto.status;
        const saved = await this.organizerRepository.save(organizer);

        return {
            message: `Organization verification marked as '${dto.status}'.`,
            organization: this.sanitize(saved),
            feedback: dto.feedback ?? null,
        };
    }

    async findAll(query?: QueryOrganizationsDto) {
        const page = Number(query?.page) || 1;
        const limit = Number(query?.limit) || 10;

        const qb = this.organizerRepository
            .createQueryBuilder('organizer')
            .leftJoinAndSelect('organizer.user', 'user')
            .leftJoinAndSelect('organizer.organizationType', 'organizationType');

        if (query?.search) {
            qb.andWhere('(organizer.name ILIKE :term OR organizer.description ILIKE :term)', {
                term: `%${query.search.trim()}%`,
            });
        }

        if (query?.organization_type_id) {
            qb.andWhere('organizer.organization_type_id = :typeId', { typeId: query.organization_type_id });
        }

        if (query?.is_organization !== undefined) {
            qb.andWhere('organizer.is_organization = :isOrg', { isOrg: query.is_organization });
        }

        if (query?.verification_status) {
            qb.andWhere('organizer.verification_status = :status', { status: query.verification_status });
        }

        const [items, total] = await qb
            .orderBy('organizer.id', 'ASC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            data: items.map((org) => this.sanitize(org)),
            total,
            page,
            limit,
        };
    }

    async findOne(id: number): Promise<Organizer> {
        const organizer = await this.organizerRepository.findOne({
            where: { id },
            relations: ['user', 'organizationType'],
        });

        if (!organizer) {
            throw new OrganizerNotFoundException(id);
        }

        return this.sanitize(organizer);
    }

    private sanitize(organizer: Organizer): Organizer {
        if (organizer.user) {
            delete (organizer.user as Partial<User>).password;
        }
        return organizer;
    }
}
