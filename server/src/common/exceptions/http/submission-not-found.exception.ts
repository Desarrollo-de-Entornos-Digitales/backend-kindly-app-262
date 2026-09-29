import { NotFoundException } from '@nestjs/common';

export class SubmissionNotFoundException extends NotFoundException {
    constructor(submissionId?: number | string, internalCode?: string) {
        super({
            error: 'Submission Not Found',
            message: submissionId ? `Submission with identifier '${submissionId}' not found.` : 'Submission not found.',
            code: internalCode,
        });
    }
}
