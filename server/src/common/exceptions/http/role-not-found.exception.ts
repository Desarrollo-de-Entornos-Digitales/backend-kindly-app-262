import { NotFoundException } from '@nestjs/common';

export class RoleNotFoundException extends NotFoundException {
    constructor(role?: number | string) {
        super(role ? `El rol '${role}' no fue encontrado.` : 'El rol solicitado no fue encontrado.');
    }
}
