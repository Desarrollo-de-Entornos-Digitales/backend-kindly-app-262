import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
    CauseNotFoundException,
    InvalidQrCodeException,
    OrganizerNotFoundException,
    VolunteerNotAcceptedException,
} from '../../common/exceptions';
import { Cause } from '../../causes/entities/cause.entity';
import { Organizer } from '../../organizations/entities/organizer.entity';
import { Volunteer } from '../../volunteers/entities/volunteer.entity';
import { Attendance } from '../entities/attendance.entity';
import { Submission } from '../entities/submission.entity';
import { SubmissionStatus } from '../submission/submission-status.enum';
import { AttendanceService } from './attendance.service';

describe('AttendanceService', () => {
    let service: AttendanceService;
    const causeRepository = {
        findOneBy: jest.fn<(where: object) => Promise<Cause | null>>(),
    };
    const organizerRepository = {
        findOneBy: jest.fn<(where: object) => Promise<Organizer | null>>(),
    };
    const volunteerRepository = {
        findOneBy: jest.fn<(where: object) => Promise<Volunteer | null>>(),
    };
    const submissionRepository = {
        existsBy: jest.fn<(where: object) => Promise<boolean>>(),
    };
    const attendanceRepository = {
        create: jest.fn((data: Partial<Attendance>) => data as Attendance),
        save: jest.fn((attendance: Attendance) =>
            Promise.resolve({ ...attendance, checked_in_at: new Date('2026-10-11T10:00:00Z') }),
        ),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AttendanceService,
                { provide: getRepositoryToken(Cause), useValue: causeRepository },
                { provide: getRepositoryToken(Organizer), useValue: organizerRepository },
                { provide: getRepositoryToken(Volunteer), useValue: volunteerRepository },
                { provide: getRepositoryToken(Submission), useValue: submissionRepository },
                { provide: getRepositoryToken(Attendance), useValue: attendanceRepository },
            ],
        }).compile();

        service = module.get(AttendanceService);
    });

    describe('getCauseQrCode', () => {
        const cause = { id: 10, organizer_id: 3, qr_code: 'QR-CAUSE-abc' } as Cause;

        it('returns the qr code to the organizer of the cause', async () => {
            causeRepository.findOneBy.mockResolvedValue(cause);
            organizerRepository.findOneBy.mockResolvedValue({ id: 3 } as Organizer);

            await expect(service.getCauseQrCode(10, 9)).resolves.toEqual({ cause_id: 10, qr_code: 'QR-CAUSE-abc' });
            expect(organizerRepository.findOneBy).toHaveBeenCalledWith({ user_id: 9 });
        });

        it('fails when the organizer does not own the cause', async () => {
            causeRepository.findOneBy.mockResolvedValue(cause);
            organizerRepository.findOneBy.mockResolvedValue({ id: 4 } as Organizer);
            await expect(service.getCauseQrCode(10, 9)).rejects.toThrow(ForbiddenException);
        });

        it('fails when the cause does not exist', async () => {
            causeRepository.findOneBy.mockResolvedValue(null);
            await expect(service.getCauseQrCode(99, 9)).rejects.toThrow(CauseNotFoundException);
        });

        it('fails when the user has no organizer profile', async () => {
            causeRepository.findOneBy.mockResolvedValue(cause);
            organizerRepository.findOneBy.mockResolvedValue(null);
            await expect(service.getCauseQrCode(10, 9)).rejects.toThrow(OrganizerNotFoundException);
        });
    });

    describe('checkIn', () => {
        const dto = { qr_code: 'QR-CAUSE-abc' };

        beforeEach(() => {
            volunteerRepository.findOneBy.mockResolvedValue({ id: 1 } as Volunteer);
            causeRepository.findOneBy.mockResolvedValue({ id: 10, qr_code: 'QR-CAUSE-abc' } as Cause);
            submissionRepository.existsBy.mockResolvedValue(true);
        });

        it('identifies the cause from the qr code and the volunteer from the jwt', async () => {
            await service.checkIn(7, dto);
            expect(volunteerRepository.findOneBy).toHaveBeenCalledWith({ user_id: 7 });
            expect(causeRepository.findOneBy).toHaveBeenCalledWith({ qr_code: 'QR-CAUSE-abc' });
        });

        it('requires an accepted submission for the cause', async () => {
            await service.checkIn(7, dto);
            expect(submissionRepository.existsBy).toHaveBeenCalledWith({
                volunteer_id: 1,
                cause_id: 10,
                status: SubmissionStatus.ACCEPTED,
            });
        });

        it('fails when the volunteer was not accepted in the cause', async () => {
            submissionRepository.existsBy.mockResolvedValue(false);
            await expect(service.checkIn(7, dto)).rejects.toThrow(VolunteerNotAcceptedException);
            expect(attendanceRepository.save).not.toHaveBeenCalled();
        });

        it('registers the attendance with its check-in time', async () => {
            const result = await service.checkIn(7, dto);

            expect(attendanceRepository.create).toHaveBeenCalledWith({ cause_id: 10, volunteer_id: 1 });
            expect(result).toEqual({
                cause_id: 10,
                volunteer_id: 1,
                checked_in_at: new Date('2026-10-11T10:00:00Z'),
            });
        });

        it('fails when the qr code does not match any cause', async () => {
            causeRepository.findOneBy.mockResolvedValue(null);
            await expect(service.checkIn(7, dto)).rejects.toThrow(InvalidQrCodeException);
        });

        it('fails when the user has no volunteer profile', async () => {
            volunteerRepository.findOneBy.mockResolvedValue(null);
            await expect(service.checkIn(7, dto)).rejects.toThrow(NotFoundException);
        });
    });
});
