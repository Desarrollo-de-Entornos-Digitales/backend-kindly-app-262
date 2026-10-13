import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { OrganizationsService } from './organizations.service';
import { Organizer } from './entities/organizer.entity';
import { User } from '../users/entities/user.entity';
import { OrganizationType } from './entities/organization-type.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { QueryOrganizationsDto } from './dto/query-organizations.dto';
import { OrganizerNotFoundException } from '../common/exceptions';

describe('OrganizationsService', () => {
    let service: OrganizationsService;

    const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn<() => Promise<[Organizer[], number]>>(),
    };

    let organizerRepository: {
        findOneBy: jest.Mock<(...args: unknown[]) => Promise<Organizer | null>>;
        findOne: jest.Mock<(...args: unknown[]) => Promise<Organizer | null>>;
        find: jest.Mock<(...args: unknown[]) => Promise<Organizer[]>>;
        create: jest.Mock<(...args: unknown[]) => Organizer>;
        save: jest.Mock<(...args: unknown[]) => Promise<Organizer>>;
        createQueryBuilder: jest.Mock<(...args: unknown[]) => typeof mockQueryBuilder>;
    };

    const createMockUser = (overrides?: Partial<User>): User => {
        const user = new User();
        user.id = 10;
        user.name = 'Juan Pérez';
        user.email = 'juan@huellasverdes.org';
        user.username = 'juanhuellas';
        user.password = 'super_secret_hashed_password';
        user.is_active = true;
        user.role_id = 2;
        user.created_at = new Date('2026-01-01T00:00:00.000Z');
        user.announcementReaction = [];
        return Object.assign(user, overrides);
    };

    const createMockOrgType = (overrides?: Partial<OrganizationType>): OrganizationType => {
        const orgType = new OrganizationType();
        orgType.id = 1;
        orgType.name = 'Fundación';
        orgType.description = 'Organización sin ánimo de lucro';
        orgType.organizers = [];
        return Object.assign(orgType, overrides);
    };

    const createMockOrganizer = (overrides?: Partial<Organizer>): Organizer => {
        const org = new Organizer();
        org.id = 1;
        org.user_id = 10;
        org.is_organization = true;
        org.name = 'Fundación Huellas Verdes';
        org.description = 'Protección del medio ambiente y reforestación comunitaria';
        org.website = 'https://huellasverdes.org';
        org.verification_file = 'rut_document.pdf';
        org.verification_status = 'pending';
        org.organization_type_id = 1;
        org.organizationType = createMockOrgType();
        org.user = createMockUser();
        org.causes = [];
        return Object.assign(org, overrides);
    };

    beforeEach(async () => {
        mockQueryBuilder.leftJoinAndSelect.mockClear().mockReturnThis();
        mockQueryBuilder.andWhere.mockClear().mockReturnThis();
        mockQueryBuilder.orderBy.mockClear().mockReturnThis();
        mockQueryBuilder.skip.mockClear().mockReturnThis();
        mockQueryBuilder.take.mockClear().mockReturnThis();
        mockQueryBuilder.getManyAndCount.mockReset().mockResolvedValue([[createMockOrganizer()], 1]);

        organizerRepository = {
            findOneBy: jest.fn((where: { user_id?: number }) => {
                if (where.user_id === 10) return Promise.resolve(createMockOrganizer());
                return Promise.resolve(null);
            }),
            findOne: jest.fn((options: { where?: { id?: number; user_id?: number } }) => {
                const id = options?.where?.id;
                const userId = options?.where?.user_id;
                if (id === 1 || userId === 10) return Promise.resolve(createMockOrganizer());
                return Promise.resolve(null);
            }),
            find: jest.fn(() => Promise.resolve([createMockOrganizer()])),
            create: jest.fn((dto: Partial<Organizer>) => createMockOrganizer(dto)),
            save: jest.fn((entity: Organizer) => Promise.resolve(entity)),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrganizationsService,
                { provide: getRepositoryToken(Organizer), useValue: organizerRepository },
            ],
        }).compile();

        service = module.get<OrganizationsService>(OrganizationsService);
    });

    describe('create', () => {
        const legalOrgDto: CreateOrganizationDto = {
            name: 'Fundación Huellas Verdes',
            description: 'Protección ambiental',
            is_organization: true,
            organization_type_id: 1,
            website: 'https://huellasverdes.org',
            verification_file: 'rut_doc.pdf',
        };

        const individualOrganizerDto: CreateOrganizationDto = {
            name: 'Carlos Líder',
            description: 'Líder voluntario independiente',
            is_organization: false,
            organization_type_id: 2,
        };

        it('should successfully register a legal organization with status "pending"', async () => {
            organizerRepository.findOneBy.mockResolvedValue(null);
            const savedOrg = createMockOrganizer({ id: 101, ...legalOrgDto, verification_status: 'pending' });
            organizerRepository.save.mockResolvedValue(savedOrg);
            organizerRepository.findOne.mockResolvedValue(savedOrg);

            const result = await service.create(99, legalOrgDto);

            expect(organizerRepository.findOneBy).toHaveBeenCalledWith({ user_id: 99 });
            expect(organizerRepository.create).toHaveBeenCalledWith({
                ...legalOrgDto,
                user_id: 99,
                verification_status: 'pending',
                verification_file: 'rut_doc.pdf',
                website: 'https://huellasverdes.org',
            });
            expect(organizerRepository.save).toHaveBeenCalled();
            expect(result.id).toBe(101);
            expect(result.verification_status).toBe('pending');
        });

        it('should successfully register an independent organizer with status "verified" and null documents', async () => {
            organizerRepository.findOneBy.mockResolvedValue(null);
            const savedOrg = createMockOrganizer({
                id: 102,
                ...individualOrganizerDto,
                verification_status: 'verified',
                verification_file: null,
                website: null,
            });
            organizerRepository.save.mockResolvedValue(savedOrg);
            organizerRepository.findOne.mockResolvedValue(savedOrg);

            const result = await service.create(88, individualOrganizerDto);

            expect(organizerRepository.create).toHaveBeenCalledWith({
                ...individualOrganizerDto,
                user_id: 88,
                verification_status: 'verified',
                verification_file: null,
                website: null,
            });
            expect(result.verification_status).toBe('verified');
            expect(result.verification_file).toBeNull();
            expect(result.website).toBeNull();
        });

        it('should throw ConflictException when profile already exists for the given user_id', async () => {
            organizerRepository.findOneBy.mockResolvedValue(createMockOrganizer({ user_id: 10 }));

            await expect(service.create(10, legalOrgDto)).rejects.toThrow(ConflictException);
            await expect(service.create(10, legalOrgDto)).rejects.toThrow(
                "Organization profile already exists for user '10'",
            );
            expect(organizerRepository.create).not.toHaveBeenCalled();
            expect(organizerRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('findByUserId', () => {
        it('should return the organization profile and sanitize the user password', async () => {
            const org = createMockOrganizer({ user_id: 10 });
            organizerRepository.findOne.mockResolvedValue(org);

            const result = await service.findByUserId(10);

            expect(organizerRepository.findOne).toHaveBeenCalledWith({
                where: { user_id: 10 },
                relations: ['user', 'organizationType'],
            });
            expect(result.id).toBe(1);
            expect(result.user).toBeDefined();
            expect((result.user as Partial<User>).password).toBeUndefined();
        });

        it('should throw OrganizerNotFoundException when user has no organization profile', async () => {
            organizerRepository.findOne.mockResolvedValue(null);

            await expect(service.findByUserId(999)).rejects.toThrow(OrganizerNotFoundException);
        });
    });

    describe('updateByUserId', () => {
        const updateDto: UpdateOrganizationDto = {
            description: 'Nueva descripción de la fundación',
            website: 'https://huellas-nuevo.org',
        };

        it('should update profile fields and return sanitized result', async () => {
            const existing = createMockOrganizer({ user_id: 10 });
            organizerRepository.findOne.mockResolvedValue(existing);

            const result = await service.updateByUserId(10, updateDto);

            expect(organizerRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: updateDto.description,
                    website: updateDto.website,
                }),
            );
            expect(result.description).toBe(updateDto.description);
            expect(result.website).toBe(updateDto.website);
            expect((result.user as Partial<User>).password).toBeUndefined();
        });

        it('should clear verification_file when organization is changed to independent (is_organization: false)', async () => {
            const existing = createMockOrganizer({ user_id: 10, is_organization: true, verification_file: 'doc.pdf' });
            organizerRepository.findOne.mockResolvedValue(existing);

            const result = await service.updateByUserId(10, { is_organization: false });

            expect(result.verification_file).toBeNull();
            expect(organizerRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    is_organization: false,
                    verification_file: null,
                }),
            );
        });
    });

    describe('submitVerification', () => {
        const submitDto: SubmitVerificationDto = {
            verification_file: 'https://storage.kindly.org/legal/camara_comercio.pdf',
        };

        it('should update verification_file and set status to "pending" for legal organizations', async () => {
            const existingOrg = createMockOrganizer({
                user_id: 10,
                is_organization: true,
                verification_status: 'unverified',
            });
            organizerRepository.findOne.mockResolvedValue(existingOrg);

            const result = await service.submitVerification(10, submitDto);

            expect(organizerRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    verification_file: submitDto.verification_file,
                    verification_status: 'pending',
                }),
            );
            expect(result).toEqual({
                message: 'Verification document submitted successfully.',
                verification_status: 'pending',
                verification_file: submitDto.verification_file,
            });
        });

        it('should throw BadRequestException when user is an independent organizer (natural person)', async () => {
            const individualOrganizer = createMockOrganizer({
                user_id: 20,
                is_organization: false,
            });
            organizerRepository.findOne.mockResolvedValue(individualOrganizer);

            await expect(service.submitVerification(20, submitDto)).rejects.toThrow(BadRequestException);
            await expect(service.submitVerification(20, submitDto)).rejects.toThrow(
                'Independent organizers (natural persons) do not require legal verification documents.',
            );
            expect(organizerRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('getVerificationStatus', () => {
        it('should return verification status with is_verified true when status is "verified"', async () => {
            const verifiedOrg = createMockOrganizer({
                id: 5,
                name: 'Fundación Planeta',
                is_organization: true,
                verification_status: 'verified',
                verification_file: 'doc.pdf',
            });
            organizerRepository.findOne.mockResolvedValue(verifiedOrg);

            const result = await service.getVerificationStatus(10);

            expect(result).toEqual({
                organizer_id: 5,
                name: 'Fundación Planeta',
                is_organization: true,
                verification_status: 'verified',
                verification_file: 'doc.pdf',
                is_verified: true,
            });
        });

        it('should return is_verified false when status is "pending" or "rejected"', async () => {
            const pendingOrg = createMockOrganizer({
                id: 6,
                name: 'Fundación Agua Viva',
                is_organization: true,
                verification_status: 'pending',
            });
            organizerRepository.findOne.mockResolvedValue(pendingOrg);

            const result = await service.getVerificationStatus(10);

            expect(result.is_verified).toBe(false);
            expect(result.verification_status).toBe('pending');
        });
    });

    describe('findPendingVerifications', () => {
        it('should return pending organizations ordered by id with sanitized user passwords', async () => {
            const pendingOrgs = [
                createMockOrganizer({ id: 1, verification_status: 'pending' }),
                createMockOrganizer({ id: 2, verification_status: 'pending' }),
            ];
            organizerRepository.find.mockResolvedValue(pendingOrgs);

            const result = await service.findPendingVerifications();

            expect(organizerRepository.find).toHaveBeenCalledWith({
                where: { verification_status: 'pending' },
                relations: ['user', 'organizationType'],
                order: { id: 'ASC' },
            });
            expect(result).toHaveLength(2);
            expect((result[0].user as Partial<User>).password).toBeUndefined();
            expect((result[1].user as Partial<User>).password).toBeUndefined();
        });
    });

    describe('reviewVerification', () => {
        const approvedDto: ReviewVerificationDto = {
            status: 'verified',
            feedback: 'Documentos legales en orden.',
        };

        const rejectedDto: ReviewVerificationDto = {
            status: 'rejected',
        };

        it('should mark organization as verified and return sanitized entity with feedback', async () => {
            const orgToReview = createMockOrganizer({ id: 1, verification_status: 'pending' });
            organizerRepository.findOne.mockResolvedValue(orgToReview);

            const result = await service.reviewVerification(1, approvedDto);

            expect(organizerRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    verification_status: 'verified',
                }),
            );
            expect(result.message).toBe("Organization verification marked as 'verified'.");
            expect(result.feedback).toBe('Documentos legales en orden.');
            expect(result.organization.verification_status).toBe('verified');
            expect((result.organization.user as Partial<User>).password).toBeUndefined();
        });

        it('should mark organization as rejected and set feedback to null if omitted', async () => {
            const orgToReview = createMockOrganizer({ id: 1, verification_status: 'pending' });
            organizerRepository.findOne.mockResolvedValue(orgToReview);

            const result = await service.reviewVerification(1, rejectedDto);

            expect(result.message).toBe("Organization verification marked as 'rejected'.");
            expect(result.feedback).toBeNull();
            expect(result.organization.verification_status).toBe('rejected');
        });
    });

    describe('findAll', () => {
        it('should return paginated list with default page 1 and limit 10 when no query is provided', async () => {
            const mockOrg = createMockOrganizer();
            mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockOrg], 1]);

            const result = await service.findAll();

            expect(organizerRepository.createQueryBuilder).toHaveBeenCalledWith('organizer');
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('organizer.user', 'user');
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
                'organizer.organizationType',
                'organizationType',
            );
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('organizer.id', 'ASC');
            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
            expect(result).toEqual({
                data: [mockOrg],
                total: 1,
                page: 1,
                limit: 10,
            });
            expect((result.data[0].user as Partial<User>).password).toBeUndefined();
        });

        it('should apply search filter on name and description', async () => {
            const query: QueryOrganizationsDto = { search: 'huellas' };
            await service.findAll(query);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                '(organizer.name ILIKE :term OR organizer.description ILIKE :term)',
                { term: '%huellas%' },
            );
        });

        it('should apply organization_type_id filter', async () => {
            const query: QueryOrganizationsDto = { organization_type_id: 3 };
            await service.findAll(query);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('organizer.organization_type_id = :typeId', {
                typeId: 3,
            });
        });

        it('should apply is_organization boolean filter', async () => {
            const query: QueryOrganizationsDto = { is_organization: true };
            await service.findAll(query);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('organizer.is_organization = :isOrg', {
                isOrg: true,
            });
        });

        it('should apply verification_status filter', async () => {
            const query: QueryOrganizationsDto = { verification_status: 'verified' };
            await service.findAll(query);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('organizer.verification_status = :status', {
                status: 'verified',
            });
        });

        it('should calculate offset correctly for custom page and limit', async () => {
            const query: QueryOrganizationsDto = { page: 3, limit: 5 };
            const result = await service.findAll(query);

            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
            expect(result.page).toBe(3);
            expect(result.limit).toBe(5);
        });
    });

    describe('findOne', () => {
        it('should return the sanitized organization profile when found by id', async () => {
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

        it('should throw OrganizerNotFoundException when organization id does not exist', async () => {
            organizerRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(OrganizerNotFoundException);
        });
    });
});
