import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, FindOptionsSelect, In, Repository } from 'typeorm';
import {
    CauseNotAvailableException,
    CauseNotFoundException,
    CauseQuotaFullException,
    DuplicateSubmissionException,
    InvalidSubmissionStatusException,
    SubmissionNotFoundException,
} from '../../common/exceptions';
import { Cause } from '../../causes/entities/cause.entity';
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
        private readonly dataSource: DataSource,
    ) {}

    async create(createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
        const { volunteer_id, cause_id, justification } = createSubmissionDto;

        const volunteer = await this.volunteerRepository.findOneBy({ id: volunteer_id });
        if (!volunteer) {
            throw new NotFoundException(`Volunteer with identifier '${volunteer_id}' not found.`);
        }

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

    findByVolunteer(volunteerId: number, filter: FilterSubmissionsDto): Promise<Submission[]> {
        return this.submissionRepository.find({
            where: { volunteer_id: volunteerId, status: filter.status },
            relations: { cause: true },
            select: { cause: CAUSE_SUMMARY },
            order: { created_at: 'DESC' },
        });
    }

    async findByCause(causeId: number, filter: FilterSubmissionsDto): Promise<Submission[]> {
        const causeExists = await this.causeRepository.existsBy({ id: causeId });
        if (!causeExists) {
            throw new CauseNotFoundException(causeId);
        }

        return this.submissionRepository.find({
            where: { cause_id: causeId, status: filter.status },
            relations: { volunteer: { user: true } },
            select: { volunteer: APPLICANT_PROFILE },
            order: { created_at: 'ASC' },
        });
    }

    async findOne(id: number): Promise<Submission> {
        const submission = await this.submissionRepository.findOne({
            where: { id },
            relations: { cause: true, volunteer: { user: true } },
            select: { cause: CAUSE_SUMMARY, volunteer: APPLICANT_PROFILE },
        });
        if (!submission) {
            throw new SubmissionNotFoundException(id);
        }
        return submission;
    }

    accept(id: number): Promise<Submission> {
        return this.dataSource.transaction(async (manager) => {
            const submission = await this.findPendingSubmission(manager, id);

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

    reject(id: number): Promise<Submission> {
        return this.dataSource.transaction(async (manager) => {
            const submission = await this.findPendingSubmission(manager, id);
            submission.status = SubmissionStatus.REJECTED;
            return manager.save(submission);
        });
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
