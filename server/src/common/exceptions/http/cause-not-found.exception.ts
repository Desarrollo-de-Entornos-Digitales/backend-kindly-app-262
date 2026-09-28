import { NotFoundException } from '@nestjs/common';

export class CauseNotFoundException extends NotFoundException {
    constructor(causeId?: number | string) {
        super(
            causeId
                ? `La causa con identificador '${causeId}' no fue encontrada.`
                : 'La causa solicitada no fue encontrada.',
        );
    }
}
