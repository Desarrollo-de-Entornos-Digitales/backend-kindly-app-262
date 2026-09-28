import { ConflictException } from '@nestjs/common';

export class DuplicateSubmissionException extends ConflictException {
    constructor(message = 'El voluntario ya cuenta con una postulación activa para esta causa.') {
        super(message);
    }
}
