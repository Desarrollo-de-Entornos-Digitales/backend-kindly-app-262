import { NotFoundException } from '@nestjs/common';

export class SkillNotFoundException extends NotFoundException {
    constructor(skillId?: number | string, internalCode?: string) {
        super({
            error: 'Skill not found',
            message: skillId ? `Category with identifier '${skillId}' not found.` : 'Skill not found',
            code: internalCode,
        });
    }
}
