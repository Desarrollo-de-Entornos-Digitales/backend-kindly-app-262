import { BadRequestException } from '@nestjs/common';

export class CauseNotAvailableException extends BadRequestException {
    constructor(detail?: string) {
        super(
            detail
                ? `La causa no está disponible: ${detail}`
                : 'La causa no se encuentra disponible para postulaciones o participaciones.',
        );
    }
}
