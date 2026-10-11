import { UnauthorizedException } from '@nestjs/common';

export class TokenMissingException extends UnauthorizedException {
    constructor(message = 'Authentication token is missing.', internalCode?: string) {
        super({
            error: 'Token Missing',
            message,
            code: internalCode,
        });
    }
}
