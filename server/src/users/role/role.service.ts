import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) {}

    async findOne(id: number): Promise<Role | null> {
        return await this.roleRepository.findOne({
            where: { id },
            relations: ['rolePermissions', 'rolePermissions.permission'],
        });
    }

    async findAll(): Promise<Role[]> {
        return await this.roleRepository.find({
            relations: ['rolePermissions', 'rolePermissions.permission'],
        });
    }

    async findByName(name: string): Promise<Role | null> {
        return await this.roleRepository.findOne({
            where: { name },
            relations: ['rolePermissions', 'rolePermissions.permission'],
        });
    }

    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        const newRole = this.roleRepository.create(createRoleDto);
        return await this.roleRepository.save(newRole);
    }

    async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role | null> {
        await this.roleRepository.update(id, updateRoleDto);
        return await this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.roleRepository.delete(id);
    }
}
