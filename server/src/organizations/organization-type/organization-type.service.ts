import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrganizationType } from '../entities/organization-type.entity';
import { CreateOrganizationTypeDto } from './dto/create-organization-type.dto';
import { UpdateOrganizationTypeDto } from './dto/update-organization-type.dto';

@Injectable()
export class OrganizationTypeService {
    constructor(
        @InjectRepository(OrganizationType)
        private readonly organizationTypeRepository: Repository<OrganizationType>,
    ) {}

    async findAll(): Promise<OrganizationType[]> {
        return await this.organizationTypeRepository.find({
            order: { id: 'ASC' },
        });
    }

    async findOne(id: number): Promise<OrganizationType> {
        const type = await this.organizationTypeRepository.findOneBy({ id });
        if (!type) {
            throw new NotFoundException(`Organization type with ID '${id}' not found.`);
        }
        return type;
    }

    async findByName(name: string): Promise<OrganizationType | null> {
        return await this.organizationTypeRepository.findOneBy({ name });
    }

    async create(createOrganizationTypeDto: CreateOrganizationTypeDto): Promise<OrganizationType> {
        const existing = await this.findByName(createOrganizationTypeDto.name);
        if (existing) {
            throw new ConflictException(
                `Organization type with name '${createOrganizationTypeDto.name}' already exists.`,
            );
        }

        const newType = this.organizationTypeRepository.create(createOrganizationTypeDto);
        return await this.organizationTypeRepository.save(newType);
    }

    async update(id: number, updateOrganizationTypeDto: UpdateOrganizationTypeDto): Promise<OrganizationType> {
        await this.findOne(id);
        await this.organizationTypeRepository.update(id, updateOrganizationTypeDto);
        return await this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.findOne(id);
        await this.organizationTypeRepository.delete(id);
    }
}
