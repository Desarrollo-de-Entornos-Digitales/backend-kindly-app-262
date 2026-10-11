import { NotFoundException } from '@nestjs/common';

export class OrganizerNotFoundException extends NotFoundException {
    constructor(organizerId?: number | string, internalCode?: string) {
        super({
            error: 'Organizer Not Found',
            message: organizerId ? `Organizer with identifier '${organizerId}' not found.` : 'Organizer not found.',
            code: internalCode,
        });
    }
}
