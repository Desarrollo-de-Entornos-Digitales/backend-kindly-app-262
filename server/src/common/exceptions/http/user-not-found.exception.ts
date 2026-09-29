import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
    constructor(userId?: number | string, internalCode?: string) {
        super({
            error: 'User Not Found',
            message: userId ? `User with identifier '${userId}' not found.` : 'User not found.',
            code: internalCode,
        });
    }
}
