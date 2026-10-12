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

import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { FilterSubmissionsDto } from './dto/filter-submissions.dto';
import { Submission } from '../entities/submission.entity';
import { SubmissionStatus } from './submission-status.enum';

describe('SubmissionController', () => {
    let controller: SubmissionController;
    let submissionService: jest.Mocked<SubmissionService>;

    const mockSubmission: Submission = {
        id: 1,
        volunteer_id: 1,
        cause_id: 2,
        status: SubmissionStatus.PENDING,
        justification: 'Motivated',
        created_at: new Date(),
        updated_at: new Date(),
    } as unknown as Submission;

    beforeEach(() => {
        submissionService = {
            create: jest.fn(),
            findMine: jest.fn(),
            findByCause: jest.fn(),
            findOne: jest.fn(),
            accept: jest.fn(),
            reject: jest.fn(),
        } as unknown as jest.Mocked<SubmissionService>;

        controller = new SubmissionController(submissionService);
    });

    describe('create', () => {
        it('should delegate application creation to submissionService.create', async () => {
            const dto: CreateSubmissionDto = { cause_id: 2, justification: 'Motivated' };
            submissionService.create.mockResolvedValue(mockSubmission);

            const result = await controller.create(1, dto);

            expect(result).toEqual(mockSubmission);
            expect(submissionService.create).toHaveBeenCalledWith(1, dto);
        });
    });

    describe('findMine', () => {
        it('should return submissions for authenticated volunteer', async () => {
            const filter: FilterSubmissionsDto = {};
            submissionService.findMine.mockResolvedValue([mockSubmission]);

            const result = await controller.findMine(1, filter);

            expect(result).toEqual([mockSubmission]);
            expect(submissionService.findMine).toHaveBeenCalledWith(1, filter);
        });
    });

    describe('findByCause', () => {
        it('should return cause submissions for organizer', async () => {
            const filter: FilterSubmissionsDto = {};
            submissionService.findByCause.mockResolvedValue([mockSubmission]);

            const result = await controller.findByCause(2, 5, filter);

            expect(result).toEqual([mockSubmission]);
            expect(submissionService.findByCause).toHaveBeenCalledWith(2, 5, filter);
        });
    });

    describe('findOne', () => {
        it('should return submission detail for volunteer or organizer', async () => {
            submissionService.findOne.mockResolvedValue(mockSubmission);

            const result = await controller.findOne(1, 1, 'volunteer');

            expect(result).toEqual(mockSubmission);
            expect(submissionService.findOne).toHaveBeenCalledWith(1, 1, 'volunteer');
        });
    });

    describe('accept', () => {
        it('should accept volunteer submission', async () => {
            const accepted = { ...mockSubmission, status: SubmissionStatus.ACCEPTED };
            submissionService.accept.mockResolvedValue(accepted);

            const result = await controller.accept(1, 5);

            expect(result.status).toBe(SubmissionStatus.ACCEPTED);
            expect(submissionService.accept).toHaveBeenCalledWith(1, 5);
        });
    });

    describe('reject', () => {
        it('should reject volunteer submission', async () => {
            const rejected = { ...mockSubmission, status: SubmissionStatus.REJECTED };
            submissionService.reject.mockResolvedValue(rejected);

            const result = await controller.reject(1, 5);

            expect(result.status).toBe(SubmissionStatus.REJECTED);
            expect(submissionService.reject).toHaveBeenCalledWith(1, 5);
        });
    });
});
