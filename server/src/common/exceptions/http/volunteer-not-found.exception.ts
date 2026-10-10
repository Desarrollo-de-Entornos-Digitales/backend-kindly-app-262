import { NotFoundException } from '@nestjs/common';

export class VolunteerNotFoundException extends NotFoundException {
    constructor(volunteerId?: number | string, internalCode?: string) {
        super({
            error: 'Volunteer not found',
            message: volunteerId ? `Volunteer with identifier '${volunteerId}' not found.` : 'Category not found',
            code: internalCode,
        });
    }
}
