import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
    constructor(identifier?: number | string) {
        super(
            identifier
                ? `El usuario con identificador '${identifier}' no fue encontrado.`
                : 'El usuario solicitado no fue encontrado.',
        );
    }
}
