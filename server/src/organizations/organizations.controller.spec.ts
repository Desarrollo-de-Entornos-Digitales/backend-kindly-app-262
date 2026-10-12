jest.mock('@nestjs/mapped-types', () => ({
    PartialType: (classRef: unknown) => classRef,
    OmitType: (classRef: unknown) => classRef,
    PickType: (classRef: unknown) => classRef,
    IntersectionType: (...classRefs: unknown[]) => classRefs[0],
}));

jest.mock('@nestjs/passport', () => ({
    AuthGuard: () => class {},
    PassportStrategy: () => class {},
}));

import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { OrganizationTypeService } from './organization-type/organization-type.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { QueryOrganizationsDto } from './dto/query-organizations.dto';
import { Organizer } from './entities/organizer.entity';

describe('OrganizationsController', () => {
    let controller: OrganizationsController;
    let organizationsService: jest.Mocked<OrganizationsService>;
    let organizationTypeService: jest.Mocked<OrganizationTypeService>;

    const mockOrganizer: Organizer = {
        id: 1,
        user_id: 5,
        name: 'Fundacion Huellas',
        description: 'Org description',
        is_organization: true,
        organization_type_id: 1,
        verification_status: 'verified',
        causes: [],
    } as unknown as Organizer;

    beforeEach(() => {
        organizationsService = {
            findByUserId: jest.fn(),
            updateByUserId: jest.fn(),
            create: jest.fn(),
            submitVerification: jest.fn(),
            getVerificationStatus: jest.fn(),
            findPendingVerifications: jest.fn(),
            reviewVerification: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
        } as unknown as jest.Mocked<OrganizationsService>;

        organizationTypeService = {
            findAll: jest.fn(),
        } as unknown as jest.Mocked<OrganizationTypeService>;

        controller = new OrganizationsController(organizationsService, organizationTypeService);
    });

    describe('getTypes', () => {
        it('should return all organization types', async () => {
            const types = [{ id: 1, name: 'ONG', description: 'Desc' }];
            organizationTypeService.findAll.mockResolvedValue(types as never);

            const result = await controller.getTypes();

            expect(result).toEqual(types);
            expect(organizationTypeService.findAll).toHaveBeenCalled();
        });
    });

    describe('getMyProfile', () => {
        it('should return organizer profile for user ID', async () => {
            organizationsService.findByUserId.mockResolvedValue(mockOrganizer);

            const result = await controller.getMyProfile(5);

            expect(result).toEqual(mockOrganizer);
            expect(organizationsService.findByUserId).toHaveBeenCalledWith(5);
        });
    });

    describe('updateMyProfile', () => {
        it('should update organization profile for user ID', async () => {
            const dto: UpdateOrganizationDto = { description: 'Updated org description' };
            organizationsService.updateByUserId.mockResolvedValue({
                ...mockOrganizer,
                description: 'Updated org description',
            });

            const result = await controller.updateMyProfile(5, dto);

            expect(result.description).toBe('Updated org description');
            expect(organizationsService.updateByUserId).toHaveBeenCalledWith(5, dto);
        });
    });

    describe('createMyProfile', () => {
        it('should create organization profile for user ID', async () => {
            const dto: CreateOrganizationDto = {
                name: 'Fundacion Huellas',
                description: 'Org description',
                is_organization: true,
                organization_type_id: 1,
            };
            organizationsService.create.mockResolvedValue(mockOrganizer);

            const result = await controller.createMyProfile(5, dto);

            expect(result).toEqual(mockOrganizer);
            expect(organizationsService.create).toHaveBeenCalledWith(5, dto);
        });
    });

    describe('submitVerificationDocument', () => {
        it('should submit verification document for organization', async () => {
            const dto: SubmitVerificationDto = { verification_file: 'https://doc.pdf' };
            const verificationResponse = {
                message: 'Verification document submitted successfully',
                verification_status: 'pending',
                verification_file: 'https://doc.pdf',
            };
            organizationsService.submitVerification.mockResolvedValue(verificationResponse);

            const result = await controller.submitVerificationDocument(5, dto);

            expect(result).toEqual(verificationResponse);
            expect(organizationsService.submitVerification).toHaveBeenCalledWith(5, dto);
        });
    });

    describe('getVerificationStatus', () => {
        it('should return verification status object', async () => {
            const statusObj = { verification_status: 'verified', verification_file: 'https://doc.pdf' };
            organizationsService.getVerificationStatus.mockResolvedValue(statusObj as never);

            const result = await controller.getVerificationStatus(5);

            expect(result).toEqual(statusObj);
            expect(organizationsService.getVerificationStatus).toHaveBeenCalledWith(5);
        });
    });

    describe('getPendingVerifications', () => {
        it('should return list of pending organizations for admin review', async () => {
            organizationsService.findPendingVerifications.mockResolvedValue([mockOrganizer]);

            const result = await controller.getPendingVerifications();

            expect(result).toEqual([mockOrganizer]);
            expect(organizationsService.findPendingVerifications).toHaveBeenCalled();
        });
    });

    describe('reviewVerification', () => {
        it('should update verification status and return reviewed organization', async () => {
            const dto: ReviewVerificationDto = { status: 'verified', feedback: 'Approved' };
            const reviewResponse = {
                message: 'Organization verification reviewed successfully',
                organization: mockOrganizer,
                feedback: 'Approved',
            };
            organizationsService.reviewVerification.mockResolvedValue(reviewResponse);

            const result = await controller.reviewVerification(1, dto);

            expect(result).toEqual(reviewResponse);
            expect(organizationsService.reviewVerification).toHaveBeenCalledWith(1, dto);
        });
    });

    describe('findAll', () => {
        it('should return paginated organizations matching query', async () => {
            const query: QueryOrganizationsDto = { page: 1, limit: 10 };
            const paginated = { data: [mockOrganizer], total: 1, page: 1, limit: 10 };
            organizationsService.findAll.mockResolvedValue(paginated);

            const result = await controller.findAll(query);

            expect(result).toEqual(paginated);
            expect(organizationsService.findAll).toHaveBeenCalledWith(query);
        });
    });

    describe('findOne', () => {
        it('should return single organization by id', async () => {
            organizationsService.findOne.mockResolvedValue(mockOrganizer);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockOrganizer);
            expect(organizationsService.findOne).toHaveBeenCalledWith(1);
        });
    });
});
