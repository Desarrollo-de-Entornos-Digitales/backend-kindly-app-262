import { UnauthorizedException } from '@nestjs/common';

export class InvalidCredentialsException extends UnauthorizedException {
    constructor(message = 'Invalid credentials provided.', internalCode?: string) {
        super({
            error: 'Invalid Credentials',
            message,
            code: internalCode,
        });
    }
}
