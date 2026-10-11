import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organizer } from '../entities/organizer.entity';
import { OrganizationType } from '../entities/organization-type.entity';
import { User } from '../../users/entities/user.entity';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';
import { OrganizerNotFoundException, UserNotFoundException } from '../../common/exceptions';

@Injectable()
export class OrganizerService {
    constructor(
        @InjectRepository(Organizer)
        private readonly organizerRepository: Repository<Organizer>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(OrganizationType)
        private readonly organizationTypeRepository: Repository<OrganizationType>,
    ) {}

    async create(createOrganizerDto: CreateOrganizerDto, userId?: number): Promise<Organizer> {
        if (userId) {
            const user = await this.userRepository.findOneBy({ id: userId });
            if (!user) {
                throw new UserNotFoundException(userId);
            }

            const existing = await this.organizerRepository.findOneBy({
                user_id: userId,
            });
            if (existing) {
                throw new ConflictException(`Organizer profile already exists for user_id '${userId}'`);
            }
        }

        // Todo organizador pertenece a una tipología de iniciativa/causa
        const type = await this.organizationTypeRepository.findOneBy({
            id: createOrganizerDto.organization_type_id,
        });
        if (!type) {
            throw new NotFoundException(
                `Organization type with ID '${createOrganizerDto.organization_type_id}' not found.`,
            );
        }

        const isOrg = createOrganizerDto.is_organization === true;

        const newOrganizer = this.organizerRepository.create({
            name: createOrganizerDto.name,
            description: createOrganizerDto.description,
            is_organization: isOrg,
            user_id: userId,
            organization_type_id: createOrganizerDto.organization_type_id,
            website: isOrg ? createOrganizerDto.website : (createOrganizerDto.website ?? null),
            verification_file: isOrg ? createOrganizerDto.verification_file : null,
            verification_status: isOrg ? 'pending' : 'verified',
        });

        const saved = await this.organizerRepository.save(newOrganizer);
        return await this.findOne(saved.id);
    }

    async findAll(): Promise<Organizer[]> {
        const organizers = await this.organizerRepository.find({
            relations: ['user', 'organizationType'],
        });

        return organizers.map((organizer) => this.sanitize(organizer));
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

    async findByUserId(userId: number): Promise<Organizer> {
        const organizer = await this.organizerRepository.findOne({
            where: { user_id: userId },
            relations: ['user', 'organizationType'],
        });

        if (!organizer) {
            throw new OrganizerNotFoundException(undefined, `No organizer profile found for user '${userId}'.`);
        }

        return this.sanitize(organizer);
    }

    async update(id: number, updateOrganizerDto: UpdateOrganizerDto): Promise<Organizer> {
        await this.findOne(id);

        if (updateOrganizerDto.organization_type_id) {
            const type = await this.organizationTypeRepository.findOneBy({
                id: updateOrganizerDto.organization_type_id,
            });
            if (!type) {
                throw new NotFoundException(
                    `Organization type with ID '${updateOrganizerDto.organization_type_id}' not found.`,
                );
            }
        }

        await this.organizerRepository.update(id, updateOrganizerDto);
        return await this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.findOne(id);
        await this.organizerRepository.delete(id);
    }

    private sanitize(organizer: Organizer): Organizer {
        if (organizer.user) {
            delete (organizer.user as Partial<User>).password;
        }
        return organizer;
    }
}
