import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

export interface CauseFields {
    title: string;
    description: string;
    capacity?: number;
    address: string;
}

@Injectable()
export class CauseValidationPipe implements PipeTransform {
    transform(value: CauseFields) {
        if (!value.title || !value.description || !value.address) {
            throw new BadRequestException('Faltan campos obligatorios para la causa');
        }

        return value;
    }
}
