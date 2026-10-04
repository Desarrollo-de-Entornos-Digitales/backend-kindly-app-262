import { NotFoundException } from '@nestjs/common';

export class RoleNotFoundException extends NotFoundException {
    constructor(roleId?: number | string, internalCode?: string) {
        super({
            error: 'Role Not Found',
            message: roleId ? `Role '${roleId}' not found.` : 'Role not found.',
            code: internalCode,
        });
    }
}
