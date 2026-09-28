import { ForbiddenException } from '@nestjs/common';

export class UserInactiveException extends ForbiddenException {
    constructor(message = 'La cuenta de usuario se encuentra inactiva o deshabilitada.') {
        super(message);
    }
}
