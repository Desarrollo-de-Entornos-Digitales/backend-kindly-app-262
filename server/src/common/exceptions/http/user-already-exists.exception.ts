import { ConflictException } from '@nestjs/common';

export class UserAlreadyExistsException extends ConflictException {
    constructor(identifier?: string, internalCode?: string) {
        super({
            error: 'User Already Exists',
            message: identifier ? `User with identifier '${identifier}' already exists.` : 'User already exists.',
            code: internalCode,
        });
    }
}
