import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

export interface DateValue {
    startDate: string;
    endDate: string;
}

@Injectable()
export class DateValidationPipe implements PipeTransform {
    transform(value: DateValue) {
        const { startDate, endDate } = value;

        if (!startDate === !endDate) {
            throw new BadRequestException('Las fechas de inicio y final son obligatorias');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const now = new Date(); //Actual date

        if (start < now) {
            throw new BadRequestException('Inválido: La fecha de inicio de la causa no puede estar en el pasado.');
        }

        if (end < start) {
            throw new BadRequestException(
                'Inválido: La fecha de finalización no puede estar antes de la fecha de inicio.',
            );
        }

        return value;
    }
}
