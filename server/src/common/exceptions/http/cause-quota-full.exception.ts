import { ConflictException } from '@nestjs/common';

export class CauseQuotaFullException extends ConflictException {
    constructor(message = 'La causa ya ha alcanzado el límite máximo de cupos para voluntarios.') {
        super(message);
    }
}
