import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    CauseNotFoundException,
    InvalidQrCodeException,
    OrganizerNotFoundException,
    VolunteerNotAcceptedException,
} from '../../common/exceptions';
import { Cause } from '../../causes/entities/cause.entity';
import { Organizer } from '../../organizations/entities/organizer.entity';
import { Volunteer } from '../../volunteers/entities/volunteer.entity';
import { Submission } from '../entities/submission.entity';
import { SubmissionStatus } from '../submission/submission-status.enum';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(Cause)
        private readonly causeRepository: Repository<Cause>,
        @InjectRepository(Organizer)
        private readonly organizerRepository: Repository<Organizer>,
        @InjectRepository(Volunteer)
        private readonly volunteerRepository: Repository<Volunteer>,
        @InjectRepository(Submission)
        private readonly submissionRepository: Repository<Submission>,
    ) {}

    async getCauseQrCode(causeId: number, userId: number): Promise<{ cause_id: number; qr_code: string }> {
        const cause = await this.causeRepository.findOneBy({ id: causeId });
        if (!cause) {
            throw new CauseNotFoundException(causeId);
        }
        const organizer = await this.organizerRepository.findOneBy({ user_id: userId });
        if (!organizer) {
            throw new OrganizerNotFoundException();
        }
        if (cause.organizer_id !== organizer.id) {
            throw new ForbiddenException(`Cause with ID '${causeId}' does not belong to the current organizer.`);
        }
        return { cause_id: cause.id, qr_code: cause.qr_code };
    }

    async checkIn(
        userId: number,
        createAttendanceDto: CreateAttendanceDto,
    ): Promise<{ cause_id: number; volunteer_id: number }> {
        const volunteer = await this.volunteerRepository.findOneBy({ user_id: userId });
        if (!volunteer) {
            throw new NotFoundException(`Volunteer profile for user '${userId}' not found.`);
        }
        const cause = await this.causeRepository.findOneBy({ qr_code: createAttendanceDto.qr_code });
        if (!cause) {
            throw new InvalidQrCodeException();
        }

        const isAccepted = await this.submissionRepository.existsBy({
            volunteer_id: volunteer.id,
            cause_id: cause.id,
            status: SubmissionStatus.ACCEPTED,
        });
        if (!isAccepted) {
            throw new VolunteerNotAcceptedException();
        }
        return { cause_id: cause.id, volunteer_id: volunteer.id };
    }
}
