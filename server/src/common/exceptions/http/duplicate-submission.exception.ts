import { ConflictException } from '@nestjs/common';

export class DuplicateSubmissionException extends ConflictException {
    constructor(message = 'Volunteer already has an active submission for this cause.', internalCode?: string) {
        super({
            error: 'Duplicate Submission',
            message,
            code: internalCode,
        });
    }
}
