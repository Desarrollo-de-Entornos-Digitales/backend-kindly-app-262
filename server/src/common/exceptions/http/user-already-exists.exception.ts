import { ConflictException } from '@nestjs/common';

export class UserAlreadyExistsException extends ConflictException {
    constructor(identifier?: string) {
        super(
            identifier
                ? `El usuario con la identificación '${identifier}' ya se encuentra registrado.`
                : 'El usuario ya se encuentra registrado en el sistema.',
        );
    }
}
