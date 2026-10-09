import { ConflictException } from '@nestjs/common';

export class InvalidSubmissionStatusException extends ConflictException {
    constructor(currentStatus?: string, internalCode?: string) {
        super({
            error: 'Invalid Submission Status',
            message: currentStatus
                ? `Submission cannot be updated because it is already '${currentStatus}'.`
                : 'Submission status transition is not allowed.',
            code: internalCode,
        });
    }
}
