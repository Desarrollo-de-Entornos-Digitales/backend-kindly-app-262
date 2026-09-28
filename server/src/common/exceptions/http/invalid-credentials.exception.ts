import { UnauthorizedException } from '@nestjs/common';

export class InvalidCredentialsException extends UnauthorizedException {
    constructor(message = 'Las credenciales proporcionadas son inválidas.') {
        super(message);
    }
}
