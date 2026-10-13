import { BadRequestException } from '@nestjs/common';
import { DateValidationPipe, DateValue } from './date-validation.pipe';

describe('DateValidationPipe', () => {
    let pipe: DateValidationPipe;

    beforeEach(() => {
        pipe = new DateValidationPipe();
    });

    it('should throw BadRequestException when both dates are empty', () => {
        const input: DateValue = {
            startDate: '',
            endDate: '',
        };

        expect(() => pipe.transform(input)).toThrow(BadRequestException);
        expect(() => pipe.transform(input)).toThrow('Las fechas de inicio y final son obligatorias');
    });

    it('should throw BadRequestException when both dates are provided due to existing condition', () => {
        const input: DateValue = {
            startDate: '2030-01-01',
            endDate: '2030-01-02',
        };

        expect(() => pipe.transform(input)).toThrow(BadRequestException);
        expect(() => pipe.transform(input)).toThrow('Las fechas de inicio y final son obligatorias');
    });

    it('should throw BadRequestException when start date is in the past and end date is empty', () => {
        const input: DateValue = {
            startDate: '2000-01-01',
            endDate: '',
        };

        expect(() => pipe.transform(input)).toThrow(BadRequestException);
        expect(() => pipe.transform(input)).toThrow(
            'Inválido: La fecha de inicio de la causa no puede estar en el pasado.',
        );
    });

    it('should return value when start date is in the future and end date is empty', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 2);

        const input: DateValue = {
            startDate: futureDate.toISOString(),
            endDate: '',
        };

        const result = pipe.transform(input);
        expect(result).toBe(input);
    });
});

