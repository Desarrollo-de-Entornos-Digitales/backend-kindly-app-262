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

import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { Attendance } from '../entities/attendance.entity';

describe('AttendanceController', () => {
    let controller: AttendanceController;
    let attendanceService: jest.Mocked<AttendanceService>;

    const mockAttendance: Attendance = {
        id: 1,
        volunteer_id: 10,
        cause_id: 2,
        checked_in_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
    } as unknown as Attendance;

    beforeEach(() => {
        attendanceService = {
            getCauseQrCode: jest.fn(),
            checkIn: jest.fn(),
        } as unknown as jest.Mocked<AttendanceService>;

        controller = new AttendanceController(attendanceService);
    });

    describe('getCauseQrCode', () => {
        it('should return cause QR code for organizer', async () => {
            const qrObj = { qr_code: 'KINDLY-CAUSE-2-QR' };
            attendanceService.getCauseQrCode.mockResolvedValue(qrObj as never);

            const result = await controller.getCauseQrCode(2, 5);

            expect(result).toEqual(qrObj);
            expect(attendanceService.getCauseQrCode).toHaveBeenCalledWith(2, 5);
        });
    });

    describe('checkIn', () => {
        it('should record volunteer check-in using QR code', async () => {
            const dto: CreateAttendanceDto = { qr_code: 'KINDLY-CAUSE-2-QR' };
            attendanceService.checkIn.mockResolvedValue(mockAttendance);

            const result = await controller.checkIn(10, dto);

            expect(result).toEqual(mockAttendance);
            expect(attendanceService.checkIn).toHaveBeenCalledWith(10, dto);
        });
    });
});
