import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { RolePermission } from '../entities/role-permission.entity';

@Injectable()
export class RolePermissionService {
    constructor(
        @InjectRepository(RolePermission)
        private readonly rolePermissionRepository: Repository<RolePermission>,
    ) {}

    async create(createRolePermissionDto: CreateRolePermissionDto): Promise<RolePermission> {
        const { role_id, permission_id } = createRolePermissionDto;

        const existing = await this.rolePermissionRepository.findOneBy({
            role_id,
            permission_id,
        });

        if (existing) {
            throw new ConflictException('This permission is already assigned to the specified role');
        }

        const rolePermission = this.rolePermissionRepository.create(createRolePermissionDto);
        return await this.rolePermissionRepository.save(rolePermission);
    }

    async findAll(): Promise<RolePermission[]> {
        return await this.rolePermissionRepository.find({
            relations: ['role', 'permission'],
        });
    }

    async findByRole(role_id: number): Promise<RolePermission[]> {
        return await this.rolePermissionRepository.find({
            where: { role_id },
            relations: ['permission'],
        });
    }

    async remove(role_id: number, permission_id: number): Promise<void> {
        const existing = await this.rolePermissionRepository.findOneBy({
            role_id,
            permission_id,
        });

        if (!existing) {
            throw new NotFoundException('The role-permission association was not found');
        }

        await this.rolePermissionRepository.delete({ role_id, permission_id });
    }
}
