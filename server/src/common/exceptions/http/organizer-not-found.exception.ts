import { NotFoundException } from '@nestjs/common';

export class OrganizerNotFoundException extends NotFoundException {
    constructor(organizerId?: number | string) {
        super(
            organizerId
                ? `El organizador con identificador '${organizerId}' no fue encontrado.`
                : 'El organizador solicitado no fue encontrado.',
        );
    }
}
