import { NotFoundException } from '@nestjs/common';

export class AchievementNotFoundException extends NotFoundException {
    constructor(achievementId?: number | string, internalCode?: string) {
        super({
            error: 'Achievement not found',
            message: achievementId
                ? `Achievement with identifier '${achievementId}' not found.`
                : 'Achievement not found',
            code: internalCode,
        });
    }
}
