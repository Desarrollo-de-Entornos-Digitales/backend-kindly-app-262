import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

import { OrganizerService } from './organizer.service';
import { Organizer } from '../entities/organizer.entity';
import { OrganizationType } from '../entities/organization-type.entity';
import { User } from '../../users/entities/user.entity';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';
import { OrganizerNotFoundException } from '../../common/exceptions';

describe('OrganizerService', () => {
    let service: OrganizerService;

    let organizerRepository: {
        create: jest.Mock<(...args: unknown[]) => Organizer>;
        save: jest.Mock<(...args: unknown[]) => Promise<Organizer>>;
        find: jest.Mock<(...args: unknown[]) => Promise<Organizer[]>>;
        findOne: jest.Mock<(...args: unknown[]) => Promise<Organizer | null>>;
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<Organizer | null>>;
        update: jest.Mock<(...args: unknown[]) => Promise<UpdateResult>>;
        delete: jest.Mock<(...args: unknown[]) => Promise<DeleteResult>>;
    };

    const createMockOrganizationType = (overrides?: Partial<OrganizationType>): OrganizationType => {
        const type = new OrganizationType();
        type.id = 1;
        type.name = 'ONG';
        type.description = 'Organización No Gubernamental';
        type.organizers = [];
        return Object.assign(type, overrides);
    };

    const createMockUser = (overrides?: Partial<User>): User => {
        const user = new User();
        user.id = 15;
        user.name = 'Fundación Planeta';
        user.username = 'fundacionplaneta';
        user.email = 'contacto@planeta.org';
        user.password = 'super_secret_pw';
        user.is_active = true;
        user.role_id = 2;
        user.created_at = new Date('2026-01-01T00:00:00.000Z');
        user.announcementReaction = [];
        return Object.assign(user, overrides);
    };

    const createMockOrganizer = (overrides?: Partial<Organizer>): Organizer => {
        const org = new Organizer();
        org.id = 1;
        org.user_id = 15;
        org.name = 'Fundación Planeta';
        org.description = 'Organización dedicada al cuidado del agua y reforestación';
        org.is_organization = true;
        org.verification_status = 'pending';
        org.website = 'https://planeta.org';
        org.verification_file = 'docs/rut_planeta.pdf';
        org.organization_type_id = 1;
        org.organizationType = createMockOrganizationType();
        org.user = createMockUser();
        org.causes = [];
        return Object.assign(org, overrides);
    };

    beforeEach(() => {
        organizerRepository = {
            create: jest.fn((entity: unknown) => Object.assign(new Organizer(), entity)),
            save: jest.fn((entity: Organizer) => Promise.resolve(entity)),
            find: jest.fn(() => Promise.resolve([createMockOrganizer()])),
            findOne: jest.fn(() => Promise.resolve(createMockOrganizer())),
            findOneBy: jest.fn(() => Promise.resolve(null)),
            update: jest.fn(() => Promise.resolve({ affected: 1, raw: [], generatedMaps: [] } as UpdateResult)),
            delete: jest.fn(() => Promise.resolve({ affected: 1, raw: [] } as DeleteResult)),
        };

        service = new OrganizerService(organizerRepository as unknown as Repository<Organizer>);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const orgDto: CreateOrganizerDto = {
            name: 'Fundación Planeta',
            description: 'Protección de bosques nativos',
            is_organization: true,
            organization_type_id: 1,
            website: 'https://planeta.org',
            verification_file: 'docs/legal.pdf',
        };

        const individualDto: CreateOrganizerDto = {
            name: 'Mario Casas',
            description: 'Organizador comunitario de limpieza de playas',
            is_organization: false,
            organization_type_id: 2,
            website: 'https://mario-blog.com',
            verification_file: 'docs/id.pdf',
        };

        it('should create organization with pending verification and keep website and file', async () => {
            organizerRepository.findOneBy.mockResolvedValue(null);
            const savedEntity = createMockOrganizer({
                id: 10,
                ...orgDto,
                user_id: 15,
                verification_status: 'pending',
            });
            organizerRepository.save.mockResolvedValue(savedEntity);
            organizerRepository.findOne.mockResolvedValue(savedEntity);

            const result = await service.create(orgDto, 15);

            expect(organizerRepository.findOneBy).toHaveBeenCalledWith({ user_id: 15 });
            expect(organizerRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: orgDto.name,
                    is_organization: true,
                    user_id: 15,
                    verification_status: 'pending',
                    verification_file: 'docs/legal.pdf',
                    website: 'https://planeta.org',
                }),
            );
            expect(result.verification_status).toBe('pending');
            expect(result.verification_file).toBe('docs/legal.pdf');
            expect(result.website).toBe('https://planeta.org');
            expect((result.user as Partial<User>).password).toBeUndefined();
        });

        it('should create individual organizer with verified status and nullify website and verification file', async () => {
            organizerRepository.findOneBy.mockResolvedValue(null);
            const savedEntity = createMockOrganizer({
                id: 12,
                ...individualDto,
                user_id: 20,
                verification_status: 'verified',
                verification_file: null,
                website: null,
            });
            organizerRepository.save.mockResolvedValue(savedEntity);
            organizerRepository.findOne.mockResolvedValue(savedEntity);

            const result = await service.create(individualDto, 20);

            expect(organizerRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: individualDto.name,
                    is_organization: false,
                    user_id: 20,
                    verification_status: 'verified',
                    verification_file: null,
                    website: null,
                }),
            );
            expect(result.verification_status).toBe('verified');
            expect(result.verification_file).toBeNull();
            expect(result.website).toBeNull();
        });

        it('should create organizer profile when userId is not provided', async () => {
            const savedEntity = createMockOrganizer({
                id: 14,
                ...orgDto,
                user_id: undefined,
                verification_status: 'pending',
            });
            organizerRepository.save.mockResolvedValue(savedEntity);
            organizerRepository.findOne.mockResolvedValue(savedEntity);

            const result = await service.create(orgDto);

            expect(organizerRepository.findOneBy).not.toHaveBeenCalled();
            expect(result.id).toBe(14);
        });

        it('should throw ConflictException when organizer profile already exists for userId', async () => {
            const existingOrganizer = createMockOrganizer({ user_id: 15 });
            organizerRepository.findOneBy.mockResolvedValue(existingOrganizer);

            await expect(service.create(orgDto, 15)).rejects.toThrow(ConflictException);
            await expect(service.create(orgDto, 15)).rejects.toThrow(
                "Organizer profile already exists for user_id '15'",
            );
            expect(organizerRepository.create).not.toHaveBeenCalled();
            expect(organizerRepository.save).not.toHaveBeenCalled();
        });

        it('should create organizer profile using user_id from DTO when userId argument is omitted', async () => {
            const dtoWithUserId: CreateOrganizerDto = {
                ...orgDto,
                user_id: 30,
            };
            organizerRepository.findOneBy.mockResolvedValue(null);
            const savedEntity = createMockOrganizer({
                id: 18,
                ...dtoWithUserId,
                user_id: 30,
                verification_status: 'pending',
            });
            organizerRepository.save.mockResolvedValue(savedEntity);
            organizerRepository.findOne.mockResolvedValue(savedEntity);

            const result = await service.create(dtoWithUserId);

            expect(organizerRepository.findOneBy).toHaveBeenCalledWith({ user_id: 30 });
            expect(organizerRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    user_id: 30,
                }),
            );
            expect(result.id).toBe(18);
        });

        it('should throw ConflictException when organizer already exists for user_id in DTO', async () => {
            const dtoWithUserId: CreateOrganizerDto = {
                ...orgDto,
                user_id: 30,
            };
            const existingOrganizer = createMockOrganizer({ user_id: 30 });
            organizerRepository.findOneBy.mockResolvedValue(existingOrganizer);

            await expect(service.create(dtoWithUserId)).rejects.toThrow(ConflictException);
            await expect(service.create(dtoWithUserId)).rejects.toThrow(
                "Organizer profile already exists for user_id '30'",
            );
        });

        it('should propagate repository error when save fails', async () => {
            organizerRepository.findOneBy.mockResolvedValue(null);
            organizerRepository.save.mockRejectedValue(new Error('DB Save Connection Failure'));

            await expect(service.create(orgDto, 15)).rejects.toThrow('DB Save Connection Failure');
        });
    });

    describe('findAll', () => {
        it('should return all organizers with relations and sanitized passwords', async () => {
            const orgs = [createMockOrganizer({ id: 1, name: 'Org 1' }), createMockOrganizer({ id: 2, name: 'Org 2' })];
            organizerRepository.find.mockResolvedValue(orgs);

            const result = await service.findAll();

            expect(organizerRepository.find).toHaveBeenCalledWith({
                relations: ['user', 'organizationType'],
            });
            expect(result).toHaveLength(2);
            expect((result[0].user as Partial<User>).password).toBeUndefined();
            expect((result[1].user as Partial<User>).password).toBeUndefined();
        });
    });

    describe('findOne', () => {
        it('should return organizer by id with sanitized password', async () => {
            const org = createMockOrganizer({ id: 1 });
            organizerRepository.findOne.mockResolvedValue(org);

            const result = await service.findOne(1);

            expect(organizerRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['user', 'organizationType'],
            });
            expect(result.id).toBe(1);
            expect((result.user as Partial<User>).password).toBeUndefined();
        });

        it('should throw OrganizerNotFoundException when id is not found', async () => {
            organizerRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(OrganizerNotFoundException);
            await expect(service.findOne(999)).rejects.toThrow("Organizer with identifier '999' not found.");
        });
    });

    describe('findByUserId', () => {
        it('should return organizer by userId with relations and sanitized password', async () => {
            const org = createMockOrganizer({ id: 1, user_id: 15 });
            organizerRepository.findOne.mockResolvedValue(org);

            const result = await service.findByUserId(15);

            expect(organizerRepository.findOne).toHaveBeenCalledWith({
                where: { user_id: 15 },
                relations: ['user', 'organizationType'],
            });
            expect(result.user_id).toBe(15);
            expect((result.user as Partial<User>).password).toBeUndefined();
        });

        it('should throw OrganizerNotFoundException when userId is not found', async () => {
            organizerRepository.findOne.mockResolvedValue(null);

            await expect(service.findByUserId(999)).rejects.toThrow(OrganizerNotFoundException);
        });
    });

    describe('update', () => {
        const updateDto: UpdateOrganizerDto = {
            description: 'Nueva descripción de impacto',
            website: 'https://nuevo-planeta.org',
        };

        it('should update organizer fields and return updated entity', async () => {
            const existing = createMockOrganizer({ id: 1 });
            const updated = createMockOrganizer({ id: 1, ...updateDto });

            organizerRepository.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(updated);

            const result = await service.update(1, updateDto);

            expect(organizerRepository.update).toHaveBeenCalledWith(1, updateDto);
            expect(result.description).toBe(updateDto.description);
            expect(result.website).toBe(updateDto.website);
        });

        it('should throw OrganizerNotFoundException when updating non-existent organizer', async () => {
            organizerRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, updateDto)).rejects.toThrow(OrganizerNotFoundException);
            expect(organizerRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should delete organizer when found', async () => {
            const existing = createMockOrganizer({ id: 1 });
            organizerRepository.findOne.mockResolvedValue(existing);

            await service.remove(1);

            expect(organizerRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw OrganizerNotFoundException when removing non-existent organizer', async () => {
            organizerRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(OrganizerNotFoundException);
            expect(organizerRepository.delete).not.toHaveBeenCalled();
        });
    });

    describe('sanitize', () => {
        it('should handle organizer entity without user relation without throwing errors', async () => {
            const orgWithoutUser = createMockOrganizer({ id: 5 });
            delete (orgWithoutUser as Partial<Organizer>).user;
            organizerRepository.findOne.mockResolvedValue(orgWithoutUser);

            const result = await service.findOne(5);

            expect(result.user).toBeUndefined();
        });
    });
});
