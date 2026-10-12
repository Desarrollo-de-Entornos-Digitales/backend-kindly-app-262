import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organizer } from '../entities/organizer.entity';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';
import { OrganizerNotFoundException } from '../../common/exceptions';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class OrganizerService {
    constructor(
        @InjectRepository(Organizer)
        private readonly organizerRepository: Repository<Organizer>,
    ) {}

    async create(dto: CreateOrganizerDto, userId?: number): Promise<Organizer> {
        if (userId) {
            const existing = await this.organizerRepository.findOneBy({ user_id: userId });
            if (existing) {
                throw new ConflictException(`Organizer profile already exists for user_id '${userId}'`);
            }
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

    async findAll(): Promise<Organizer[]> {
        const organizers = await this.organizerRepository.find({
            relations: ['user', 'organizationType'],
        });
        return organizers.map((org) => this.sanitize(org));
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

    async update(id: number, dto: UpdateOrganizerDto): Promise<Organizer> {
        await this.findOne(id);
        await this.organizerRepository.update(id, dto);
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
