import { ForbiddenException } from '@nestjs/common';

export class OrganizationNotVerifiedException extends ForbiddenException {
    constructor(message = 'Organization is not verified to perform this action.', internalCode?: string) {
        super({
            error: 'Organization Not Verified',
            message,
            code: internalCode,
        });
    }
}
