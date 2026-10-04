import { ForbiddenException } from '@nestjs/common';

export class VolunteerNotAcceptedException extends ForbiddenException {
    constructor(message = 'Volunteer does not have an accepted submission for this cause.', internalCode?: string) {
        super({
            error: 'Volunteer Not Accepted',
            message,
            code: internalCode,
        });
    }
}
