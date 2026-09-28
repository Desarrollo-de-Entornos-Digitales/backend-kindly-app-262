import { ForbiddenException } from '@nestjs/common';

export class VolunteerNotAcceptedException extends ForbiddenException {
    constructor(message = 'El voluntario no tiene una postulación aprobada o aceptada para esta causa.') {
        super(message);
    }
}
