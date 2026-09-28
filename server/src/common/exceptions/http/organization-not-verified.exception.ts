import { ForbiddenException } from '@nestjs/common';

export class OrganizationNotVerifiedException extends ForbiddenException {
    constructor(message = 'La organización no se encuentra verificada para realizar esta acción.') {
        super(message);
    }
}
