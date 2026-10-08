import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { RoleService } from './role/role.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { RoleNotFoundException, UserNotFoundException } from '../common/exceptions';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly roleService: RoleService,
    ) {}

    async findAll(query: QueryUsersDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;

        const baseWhere: FindOptionsWhere<User> = {};
        if (query.role_id !== undefined) {
            baseWhere.role_id = query.role_id;
        }
        if (query.is_active !== undefined) {
            baseWhere.is_active = query.is_active;
        }

        let where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = baseWhere;

        if (query.search && query.search.trim() !== '') {
            const searchTerm = `%${query.search.trim()}%`;
            where = [
                { ...baseWhere, name: ILike(searchTerm) },
                { ...baseWhere, email: ILike(searchTerm) },
                { ...baseWhere, username: ILike(searchTerm) },
            ];
        }

        const [users, total] = await this.userRepository.findAndCount({
            where,
            relations: {
                role: {
                    rolePermissions: {
                        permission: true,
                    },
                },
            },
            order: { created_at: 'DESC' },
            skip,
            take: limit,
        });

        // Strip sensitive password column from response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const sanitizedUsers = users.map(({ password: _, ...user }) => user);

        return {
            data: sanitizedUsers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }

    async findOne(id: number): Promise<Omit<User, 'password'>> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: {
                role: {
                    rolePermissions: {
                        permission: true,
                    },
                },
                volunteer: true,
                organizer: true,
            },
        });

        if (!user) {
            throw new UserNotFoundException(id);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async updateStatus(
        id: number,
        updateUserStatusDto: UpdateUserStatusDto,
    ): Promise<Omit<User, 'password'>> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: {
                role: true,
            },
        });

        if (!user) {
            throw new UserNotFoundException(id);
        }

        user.is_active = updateUserStatusDto.is_active;
        const savedUser = await this.userRepository.save(user);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = savedUser;
        return userWithoutPassword;
    }

    async assignRole(
        id: number,
        assignRoleDto: AssignRoleDto,
    ): Promise<Omit<User, 'password'>> {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new UserNotFoundException(id);
        }

        const role = await this.roleService.findOne(assignRoleDto.role_id);
        if (!role) {
            throw new RoleNotFoundException(assignRoleDto.role_id);
        }

        user.role = role;
        user.role_id = role.id;
        const savedUser = await this.userRepository.save(user);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = savedUser;
        return userWithoutPassword;
    }
}
