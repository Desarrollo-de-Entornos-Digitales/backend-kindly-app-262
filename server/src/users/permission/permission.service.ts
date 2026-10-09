import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
    ) {}

    async findAll(): Promise<Permission[]> {
        return await this.permissionRepository.find();
    }

    async findOne(id: number): Promise<Permission | null> {
        return await this.permissionRepository.findOneBy({ id });
    }

    async findByName(name: string): Promise<Permission | null> {
        return await this.permissionRepository.findOneBy({ name });
    }

    async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
        const newPermission = this.permissionRepository.create(createPermissionDto);
        return await this.permissionRepository.save(newPermission);
    }

    async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission | null> {
        await this.permissionRepository.update(id, updatePermissionDto);
        return await this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.permissionRepository.delete(id);
    }
}
