import { ConflictException } from '@nestjs/common';

export class DuplicateAttendanceException extends ConflictException {
    constructor(message = 'Attendance has already been recorded for this volunteer.', internalCode?: string) {
        super({
            error: 'Duplicate Attendance',
            message,
            code: internalCode,
        });
    }
}
