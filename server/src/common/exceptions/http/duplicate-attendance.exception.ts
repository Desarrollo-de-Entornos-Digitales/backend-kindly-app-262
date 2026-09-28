import { ConflictException } from '@nestjs/common';

export class DuplicateAttendanceException extends ConflictException {
    constructor(message = 'La asistencia para este voluntario ya se encuentra registrada en esta sesión.') {
        super(message);
    }
}
