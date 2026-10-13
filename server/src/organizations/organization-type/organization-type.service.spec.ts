import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

import { OrganizationTypeService } from './organization-type.service';
import { OrganizationType } from '../entities/organization-type.entity';
import { CreateOrganizationTypeDto } from './dto/create-organization-type.dto';
import { UpdateOrganizationTypeDto } from './dto/update-organization-type.dto';

describe('OrganizationTypeService', () => {
    let service: OrganizationTypeService;

    let organizationTypeRepository: {
        find: jest.Mock<(...args: unknown[]) => Promise<OrganizationType[]>>;
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<OrganizationType | null>>;
        create: jest.Mock<(...args: unknown[]) => OrganizationType>;
        save: jest.Mock<(...args: unknown[]) => Promise<OrganizationType>>;
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

    beforeEach(() => {
        organizationTypeRepository = {
            find: jest.fn(() => Promise.resolve([createMockOrganizationType()])),
            findOneBy: jest.fn(() => Promise.resolve(createMockOrganizationType())),
            create: jest.fn((entity: unknown) => Object.assign(new OrganizationType(), entity)),
            save: jest.fn((entity: OrganizationType) => Promise.resolve(entity)),
            update: jest.fn(() => Promise.resolve({ affected: 1, raw: [], generatedMaps: [] } as UpdateResult)),
            delete: jest.fn(() => Promise.resolve({ affected: 1, raw: [] } as DeleteResult)),
        };

        service = new OrganizationTypeService(organizationTypeRepository as unknown as Repository<OrganizationType>);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all organization types ordered by id ascending', async () => {
            const types = [
                createMockOrganizationType({ id: 1, name: 'ONG' }),
                createMockOrganizationType({ id: 2, name: 'Fundación' }),
            ];
            organizationTypeRepository.find.mockResolvedValue(types);

            const result = await service.findAll();

            expect(organizationTypeRepository.find).toHaveBeenCalledWith({
                order: { id: 'ASC' },
            });
            expect(result).toEqual(types);
        });

        it('should return an empty array when no organization types exist', async () => {
            organizationTypeRepository.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });

        it('should propagate repository error when find fails', async () => {
            organizationTypeRepository.find.mockRejectedValue(new Error('Database search error'));

            await expect(service.findAll()).rejects.toThrow('Database search error');
        });
    });

    describe('findOne', () => {
        it('should return the organization type when found by id', async () => {
            const type = createMockOrganizationType({ id: 1, name: 'ONG' });
            organizationTypeRepository.findOneBy.mockResolvedValue(type);

            const result = await service.findOne(1);

            expect(organizationTypeRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(result).toEqual(type);
        });

        it('should throw NotFoundException when organization type does not exist', async () => {
            organizationTypeRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(99)).rejects.toThrow("Organization type with ID '99' not found.");
        });

        it('should propagate repository error when findOneBy fails', async () => {
            organizationTypeRepository.findOneBy.mockRejectedValue(new Error('Connection failure'));

            await expect(service.findOne(1)).rejects.toThrow('Connection failure');
        });
    });

    describe('findByName', () => {
        it('should return the organization type when found by name', async () => {
            const type = createMockOrganizationType({ name: 'Corporación' });
            organizationTypeRepository.findOneBy.mockResolvedValue(type);

            const result = await service.findByName('Corporación');

            expect(organizationTypeRepository.findOneBy).toHaveBeenCalledWith({
                name: 'Corporación',
            });
            expect(result).toEqual(type);
        });

        it('should return null when organization type name does not exist', async () => {
            organizationTypeRepository.findOneBy.mockResolvedValue(null);

            const result = await service.findByName('Inexistente');

            expect(organizationTypeRepository.findOneBy).toHaveBeenCalledWith({
                name: 'Inexistente',
            });
            expect(result).toBeNull();
        });

        it('should propagate repository error when findByName fails', async () => {
            organizationTypeRepository.findOneBy.mockRejectedValue(new Error('Query timeout'));

            await expect(service.findByName('ONG')).rejects.toThrow('Query timeout');
        });
    });

    describe('create', () => {
        const dto: CreateOrganizationTypeDto = {
            name: 'Asociación Civil',
            description: 'Entidad sin ánimo de lucro constituida por ciudadanos',
        };

        it('should successfully create and return a new organization type', async () => {
            organizationTypeRepository.findOneBy.mockResolvedValue(null);
            const savedType = createMockOrganizationType({ id: 3, ...dto });
            organizationTypeRepository.save.mockResolvedValue(savedType);

            const result = await service.create(dto);

            expect(organizationTypeRepository.findOneBy).toHaveBeenCalledWith({
                name: 'Asociación Civil',
            });
            expect(organizationTypeRepository.create).toHaveBeenCalledWith(dto);
            expect(organizationTypeRepository.save).toHaveBeenCalled();
            expect(result).toEqual(savedType);
        });

        it('should throw ConflictException when organization type name already exists', async () => {
            const existing = createMockOrganizationType({ name: 'Asociación Civil' });
            organizationTypeRepository.findOneBy.mockResolvedValue(existing);

            await expect(service.create(dto)).rejects.toThrow(ConflictException);
            await expect(service.create(dto)).rejects.toThrow(
                "Organization type with name 'Asociación Civil' already exists.",
            );
            expect(organizationTypeRepository.create).not.toHaveBeenCalled();
            expect(organizationTypeRepository.save).not.toHaveBeenCalled();
        });

        it('should propagate repository error when save fails', async () => {
            organizationTypeRepository.findOneBy.mockResolvedValue(null);
            organizationTypeRepository.save.mockRejectedValue(new Error('Save constraint error'));

            await expect(service.create(dto)).rejects.toThrow('Save constraint error');
        });
    });

    describe('update', () => {
        const updateDto: UpdateOrganizationTypeDto = {
            name: 'ONG Internacional',
            description: 'Organización no gubernamental con alcance global',
        };

        it('should successfully update and return the updated organization type', async () => {
            const existing = createMockOrganizationType({ id: 1, name: 'ONG' });
            const updated = createMockOrganizationType({ id: 1, ...updateDto });
            organizationTypeRepository.findOneBy.mockResolvedValueOnce(existing).mockResolvedValueOnce(updated);

            const result = await service.update(1, updateDto);

            expect(organizationTypeRepository.update).toHaveBeenCalledWith(1, updateDto);
            expect(result).toEqual(updated);
        });

        it('should throw NotFoundException when organization type to update does not exist', async () => {
            organizationTypeRepository.findOneBy.mockResolvedValue(null);

            await expect(service.update(99, updateDto)).rejects.toThrow(NotFoundException);
            expect(organizationTypeRepository.update).not.toHaveBeenCalled();
        });

        it('should propagate repository error when update fails', async () => {
            organizationTypeRepository.findOneBy.mockResolvedValue(createMockOrganizationType());
            organizationTypeRepository.update.mockRejectedValue(new Error('Update DB failure'));

            await expect(service.update(1, updateDto)).rejects.toThrow('Update DB failure');
        });
    });

    describe('remove', () => {
        it('should successfully delete organization type when found', async () => {
            const existing = createMockOrganizationType({ id: 1 });
            organizationTypeRepository.findOneBy.mockResolvedValue(existing);

            await service.remove(1);

            expect(organizationTypeRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when organization type to delete does not exist', async () => {
            organizationTypeRepository.findOneBy.mockResolvedValue(null);

            await expect(service.remove(99)).rejects.toThrow(NotFoundException);
            expect(organizationTypeRepository.delete).not.toHaveBeenCalled();
        });

        it('should propagate repository error when delete fails', async () => {
            organizationTypeRepository.findOneBy.mockResolvedValue(createMockOrganizationType());
            organizationTypeRepository.delete.mockRejectedValue(new Error('Delete DB failure'));

            await expect(service.remove(1)).rejects.toThrow('Delete DB failure');
        });
    });
});
