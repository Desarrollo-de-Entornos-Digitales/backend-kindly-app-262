import { NotFoundException } from '@nestjs/common';

export class CauseNotFoundException extends NotFoundException {
    constructor(causeId?: number | string, internalCode?: string) {
        super({
            error: 'Cause Not Found',
            message: causeId ? `Cause with identifier '${causeId}' not found.` : 'Cause not found.',
            code: internalCode,
        });
    }
}
