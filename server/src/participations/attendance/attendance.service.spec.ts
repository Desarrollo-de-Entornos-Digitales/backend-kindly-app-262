import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CauseNotFoundException, OrganizerNotFoundException } from '../../common/exceptions';
import { Cause } from '../../causes/entities/cause.entity';
import { Organizer } from '../../organizations/entities/organizer.entity';
import { AttendanceService } from './attendance.service';

describe('AttendanceService', () => {
    let service: AttendanceService;
    const causeRepository = {
        findOneBy: jest.fn<(where: object) => Promise<Cause | null>>(),
    };
    const organizerRepository = {
        findOneBy: jest.fn<(where: object) => Promise<Organizer | null>>(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AttendanceService,
                { provide: getRepositoryToken(Cause), useValue: causeRepository },
                { provide: getRepositoryToken(Organizer), useValue: organizerRepository },
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
});
