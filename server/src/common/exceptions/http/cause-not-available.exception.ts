import { BadRequestException } from '@nestjs/common';

export class CauseNotAvailableException extends BadRequestException {
    constructor(detail?: string, internalCode?: string) {
        super({
            error: 'Cause Not Available',
            message: detail ? `Cause is not available: ${detail}` : 'Cause is not available for applications.',
            code: internalCode,
        });
    }
}
