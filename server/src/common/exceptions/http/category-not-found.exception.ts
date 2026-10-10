import { NotFoundException } from '@nestjs/common';

export class CategoryNotFoundException extends NotFoundException {
    constructor(categoryId?: number | string, internalCode?: string) {
        super({
            error: 'Category not found',
            message: categoryId ? `Category with identifier '${categoryId}' not found.` : 'Category not found',
            code: internalCode,
        });
    }
}
