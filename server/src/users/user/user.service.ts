import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { User } from '../entities/user.entity';
import { RoleService } from '../role/role.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleNotFoundException, UserAlreadyExistsException, UserNotFoundException } from '../../common/exceptions';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly roleService: RoleService,
        private readonly configService: ConfigService,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { roleId, ...userData } = createUserDto;
        const role = await this.roleService.findOne(roleId);

        if (!role) {
            throw new RoleNotFoundException(roleId);
        }

        const existingUser = await this.findByEmailOrUsername(userData.email, userData.username);
        if (existingUser) {
            throw new UserAlreadyExistsException('User with this email or username already exists');
        }

        const saltRounds = parseInt(this.configService.get<string>('SALT_ROUNDS') ?? '10', 10);
        const rawPassword = createUserDto.passwordHash || (createUserDto as any).password;
        const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

        const user = this.userRepository.create({
            name: userData.name,
            username: userData.username,
            email: userData.email,
            contact: userData.contact,
            profile_picture: userData.profile_picture,
            password: hashedPassword,
            is_active: userData.is_active ?? true,
            role,
        });

        const savedUser = await this.userRepository.save(user);

        const { password: _, ...userWithoutPassword } = savedUser;
        return userWithoutPassword as User;
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find({
            relations: {
                role: {
                    rolePermissions: {
                        permission: true,
                    },
                },
            },
        });
    }

    async findOne(id: number): Promise<User | null> {
        return this.userRepository.findOne({
            where: { id },
            relations: ['role'],
        });
    }

    async findOneWithPermissions(id: number): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: {
                role: {
                    rolePermissions: {
                        permission: true,
                    },
                },
            },
        });
        return user || null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { email },
            relations: {
                role: {
                    rolePermissions: {
                        permission: true,
                    },
                },
            },
        });
        return user || null;
    }

    async findByUsername(username: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { username },
            relations: {
                role: {
                    rolePermissions: {
                        permission: true,
                    },
                },
            },
        });
        return user || null;
    }

    async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: [{ email }, { username }],
            relations: {
                role: {
                    rolePermissions: {
                        permission: true,
                    },
                },
            },
        });
        return user || null;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);
        if (!user) {
            throw new UserNotFoundException(id);
        }

        Object.assign(user, updateUserDto);
        return this.userRepository.save(user);
    }

    async updateStatus(id: number, isActive: boolean): Promise<User> {
        const user = await this.findOne(id);
        if (!user) {
            throw new UserNotFoundException(id);
        }

        user.is_active = isActive;
        return this.userRepository.save(user);
    }

    async updateRole(id: number, roleId: number): Promise<User> {
        const user = await this.findOne(id);
        if (!user) {
            throw new UserNotFoundException(id);
        }

        const role = await this.roleService.findOne(roleId);
        if (!role) {
            throw new RoleNotFoundException(roleId);
        }

        user.role = role;
        user.role_id = role.id;
        return this.userRepository.save(user);
    }

    async remove(id: number): Promise<void> {
        const user = await this.findOne(id);
        if (!user) {
            throw new UserNotFoundException(id);
        }

        await this.userRepository.remove(user);
    }
}
