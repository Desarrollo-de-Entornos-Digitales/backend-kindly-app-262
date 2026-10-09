import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, FindOptionsSelect, In, Repository } from 'typeorm';
import {
    CauseNotAvailableException,
    CauseNotFoundException,
    CauseQuotaFullException,
    DuplicateSubmissionException,
    InvalidSubmissionStatusException,
    OrganizerNotFoundException,
    SubmissionNotFoundException,
} from '../../common/exceptions';
import { Cause } from '../../causes/entities/cause.entity';
import { Organizer } from '../../organizations/entities/organizer.entity';
import { Volunteer } from '../../volunteers/entities/volunteer.entity';
import { Submission } from '../entities/submission.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { FilterSubmissionsDto } from './dto/filter-submissions.dto';
import { SubmissionStatus } from './submission-status.enum';

const CAUSE_SUMMARY: FindOptionsSelect<Cause> = {
    id: true,
    title: true,
    address: true,
    start_date: true,
    end_date: true,
    capacity: true,
    is_available: true,
};

const APPLICANT_PROFILE: FindOptionsSelect<Volunteer> = {
    id: true,
    description: true,
    completed_causes: true,
    user: { id: true, name: true, username: true, email: true, contact: true },
};

@Injectable()
export class SubmissionService {
    constructor(
        @InjectRepository(Submission)
        private readonly submissionRepository: Repository<Submission>,
        @InjectRepository(Cause)
        private readonly causeRepository: Repository<Cause>,
        @InjectRepository(Volunteer)
        private readonly volunteerRepository: Repository<Volunteer>,
        @InjectRepository(Organizer)
        private readonly organizerRepository: Repository<Organizer>,
        private readonly dataSource: DataSource,
    ) {}

    async create(userId: number, createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
        const { cause_id, justification } = createSubmissionDto;

        const volunteer_id = (await this.findVolunteerByUser(userId)).id;

        const cause = await this.causeRepository.findOneBy({ id: cause_id });
        if (!cause) {
            throw new CauseNotFoundException(cause_id);
        }
        if (!cause.is_available) {
            throw new CauseNotAvailableException();
        }
        if (cause.end_date < new Date()) {
            throw new CauseNotAvailableException('the cause has already ended');
        }

        const activeSubmission = await this.submissionRepository.existsBy({
            volunteer_id,
            cause_id,
            status: In([SubmissionStatus.PENDING, SubmissionStatus.ACCEPTED]),
        });
        if (activeSubmission) {
            throw new DuplicateSubmissionException();
        }

        await this.assertCapacityAvailable(this.dataSource.manager, cause);

        const submission = this.submissionRepository.create({
            volunteer_id,
            cause_id,
            justification,
            status: SubmissionStatus.PENDING,
        });
        return this.submissionRepository.save(submission);
    }

    async findMine(userId: number, filter: FilterSubmissionsDto): Promise<Submission[]> {
        const volunteer = await this.findVolunteerByUser(userId);
        return this.submissionRepository.find({
            where: { volunteer_id: volunteer.id, status: filter.status },
            relations: { cause: true },
            select: { cause: CAUSE_SUMMARY },
            order: { created_at: 'DESC' },
        });
    }

    async findByCause(causeId: number, userId: number, filter: FilterSubmissionsDto): Promise<Submission[]> {
        await this.assertCauseOwner(causeId, userId);

        return this.submissionRepository.find({
            where: { cause_id: causeId, status: filter.status },
            relations: { volunteer: { user: true } },
            select: { volunteer: APPLICANT_PROFILE },
            order: { created_at: 'ASC' },
        });
    }

    async findOne(id: number, userId: number, role: string): Promise<Submission> {
        const submission = await this.submissionRepository.findOne({
            where: { id },
            relations: { cause: true, volunteer: { user: true } },
            select: { cause: CAUSE_SUMMARY, volunteer: APPLICANT_PROFILE },
        });
        if (!submission) {
            throw new SubmissionNotFoundException(id);
        }

        const canView =
            role === 'organizer'
                ? await this.causeRepository.existsBy({
                      id: submission.cause_id,
                      organizer_id: (await this.findOrganizerByUser(userId)).id,
                  })
                : submission.volunteer_id === (await this.findVolunteerByUser(userId)).id;
        if (!canView) {
            throw new ForbiddenException(`Submission with ID '${id}' does not belong to the current user.`);
        }
        return submission;
    }

    accept(id: number, userId: number): Promise<Submission> {
        return this.dataSource.transaction(async (manager) => {
            const submission = await this.findPendingSubmission(manager, id);
            await this.assertCauseOwner(submission.cause_id, userId);

            const cause = await manager.findOne(Cause, {
                where: { id: submission.cause_id },
                lock: { mode: 'pessimistic_write' },
            });
            if (!cause) {
                throw new CauseNotFoundException(submission.cause_id);
            }
            await this.assertCapacityAvailable(manager, cause);

            submission.status = SubmissionStatus.ACCEPTED;
            return manager.save(submission);
        });
    }

    reject(id: number, userId: number): Promise<Submission> {
        return this.dataSource.transaction(async (manager) => {
            const submission = await this.findPendingSubmission(manager, id);
            await this.assertCauseOwner(submission.cause_id, userId);
            submission.status = SubmissionStatus.REJECTED;
            return manager.save(submission);
        });
    }

    private async findVolunteerByUser(userId: number): Promise<Volunteer> {
        const volunteer = await this.volunteerRepository.findOneBy({ user_id: userId });
        if (!volunteer) {
            throw new NotFoundException(`Volunteer profile for user '${userId}' not found.`);
        }
        return volunteer;
    }

    private async findOrganizerByUser(userId: number): Promise<Organizer> {
        const organizer = await this.organizerRepository.findOneBy({ user_id: userId });
        if (!organizer) {
            throw new OrganizerNotFoundException();
        }
        return organizer;
    }

    private async assertCauseOwner(causeId: number, userId: number): Promise<void> {
        const cause = await this.causeRepository.findOneBy({ id: causeId });
        if (!cause) {
            throw new CauseNotFoundException(causeId);
        }
        const organizer = await this.findOrganizerByUser(userId);
        if (cause.organizer_id !== organizer.id) {
            throw new ForbiddenException(`Cause with ID '${causeId}' does not belong to the current organizer.`);
        }
    }

    private async findPendingSubmission(manager: EntityManager, id: number): Promise<Submission> {
        const submission = await manager.findOneBy(Submission, { id });
        if (!submission) {
            throw new SubmissionNotFoundException(id);
        }
        if (submission.status !== SubmissionStatus.PENDING) {
            throw new InvalidSubmissionStatusException(submission.status);
        }
        return submission;
    }

    private async assertCapacityAvailable(manager: EntityManager, cause: Cause): Promise<void> {
        if (cause.capacity === null || cause.capacity === undefined) {
            return;
        }
        const accepted = await manager.countBy(Submission, {
            cause_id: cause.id,
            status: SubmissionStatus.ACCEPTED,
        });
        if (accepted >= cause.capacity) {
            throw new CauseQuotaFullException();
        }
    }
}
