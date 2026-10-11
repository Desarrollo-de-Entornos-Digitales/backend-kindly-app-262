import { UnauthorizedException } from '@nestjs/common';

export class InvalidTokenException extends UnauthorizedException {
    constructor(message = 'Invalid or malformed token.', internalCode?: string) {
        super({
            error: 'Invalid Token',
            message,
            code: internalCode,
        });
    }
}
