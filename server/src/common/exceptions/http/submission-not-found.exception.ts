import { NotFoundException } from '@nestjs/common';

export class SubmissionNotFoundException extends NotFoundException {
    constructor(submissionId?: number | string) {
        super(
            submissionId
                ? `La postulación con identificador '${submissionId}' no fue encontrada.`
                : 'La postulación solicitada no fue encontrada.',
        );
    }
}
