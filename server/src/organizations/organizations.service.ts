import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organizer } from './entities/organizer.entity';
import { OrganizationType } from './entities/organization-type.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { QueryOrganizationsDto } from './dto/query-organizations.dto';
import { OrganizerNotFoundException, UserNotFoundException } from '../common/exceptions';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organizer)
        private readonly organizerRepository: Repository<Organizer>,
        @InjectRepository(OrganizationType)
        private readonly organizationTypeRepository: Repository<OrganizationType>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(userId: number, createDto: CreateOrganizationDto): Promise<Organizer> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new UserNotFoundException(userId);
        }

        const existing = await this.organizerRepository.findOneBy({ user_id: userId });
        if (existing) {
            throw new ConflictException(`Organization profile already exists for user_id '${userId}'`);
        }

        const type = await this.organizationTypeRepository.findOneBy({
            id: createDto.organization_type_id,
        });
        if (!type) {
            throw new NotFoundException(`Organization type with ID '${createDto.organization_type_id}' not found.`);
        }

        const isOrg = createDto.is_organization === true;

        const newOrganizer = this.organizerRepository.create({
            name: createDto.name,
            description: createDto.description,
            is_organization: isOrg,
            user_id: userId,
            organization_type_id: createDto.organization_type_id,
            website: isOrg ? createDto.website : (createDto.website ?? null),
            verification_file: isOrg ? createDto.verification_file : null,
            verification_status: isOrg ? 'pending' : 'verified',
        });

        const saved = await this.organizerRepository.save(newOrganizer);
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

    async updateByUserId(userId: number, updateDto: UpdateOrganizationDto): Promise<Organizer> {
        const organizer = await this.findByUserId(userId);

        if (updateDto.organization_type_id) {
            const type = await this.organizationTypeRepository.findOneBy({
                id: updateDto.organization_type_id,
            });
            if (!type) {
                throw new NotFoundException(`Organization type with ID '${updateDto.organization_type_id}' not found.`);
            }
        }

        // Proteger campos sensibles que no se deben alterar desde actualización libre de perfil
        const { user_id: _userId, verification_status: _status, ...dataToUpdate } = updateDto as any;

        if (dataToUpdate.is_organization === false) {
            dataToUpdate.verification_file = null;
        }

        await this.organizerRepository.update(organizer.id, dataToUpdate);
        return await this.findOne(organizer.id);
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
        const organizer = await this.organizerRepository.findOne({
            where: { id },
            relations: ['user', 'organizationType'],
        });

        if (!organizer) {
            throw new OrganizerNotFoundException(id);
        }

        organizer.verification_status = dto.status;
        const saved = await this.organizerRepository.save(organizer);

        return {
            message: `Organization verification marked as '${dto.status}'.`,
            organization: this.sanitize(saved),
            feedback: dto.feedback ?? null,
        };
    }

    async findAll(query?: QueryOrganizationsDto) {
        const page = query?.page && query.page > 0 ? Number(query.page) : 1;
        const limit = query?.limit && query.limit > 0 ? Number(query.limit) : 10;
        const skip = (page - 1) * limit;

        const qb = this.organizerRepository
            .createQueryBuilder('organizer')
            .leftJoinAndSelect('organizer.user', 'user')
            .leftJoinAndSelect('organizer.organizationType', 'organizationType');

        if (query?.search) {
            const term = `%${query.search.trim()}%`;
            qb.andWhere('(organizer.name ILIKE :term OR organizer.description ILIKE :term)', { term });
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

        qb.orderBy('organizer.id', 'ASC').skip(skip).take(limit);

        const [items, total] = await qb.getManyAndCount();

        return {
            data: items.map((item) => this.sanitize(item)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
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
