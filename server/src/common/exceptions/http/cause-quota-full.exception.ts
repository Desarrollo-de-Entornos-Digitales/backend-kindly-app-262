import { ConflictException } from '@nestjs/common';

export class CauseQuotaFullException extends ConflictException {
    constructor(message = 'Cause has reached its maximum volunteer capacity.', internalCode?: string) {
        super({
            error: 'Cause Quota Full',
            message,
            code: internalCode,
        });
    }
}
