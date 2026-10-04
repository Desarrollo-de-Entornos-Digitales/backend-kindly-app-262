import { UnauthorizedException } from '@nestjs/common';

export class TokenExpiredException extends UnauthorizedException {
    constructor(message = 'Token has expired.', internalCode?: string) {
        super({
            error: 'Token Expired',
            message,
            code: internalCode,
        });
    }
}
