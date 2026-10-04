import { ForbiddenException } from '@nestjs/common';

export class UserInactiveException extends ForbiddenException {
    constructor(message = 'User account is inactive or disabled.', internalCode?: string) {
        super({
            error: 'User Inactive',
            message,
            code: internalCode,
        });
    }
}
