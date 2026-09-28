import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface DateValidationOptions {
    startDate: Date;
    endDate: Date;
}

@Injectable()
export class DateValidationPipe implements PipeTransform {
    constructor(private readonly options: DateValidationOptions) {}

    transform(value: any) {
        const { startDate, endDate } = value;

        if (startDate > endDate) {
            throw new BadRequestException('The end date is not valid');
        }

        if (endDate < startDate) {
            throw new BadRequestException('The end date cannot be before the start date.');
        }
    }
}
