import { BadRequestException } from '@nestjs/common';
import { CauseFields, CauseValidationPipe } from './cause-validation.pipe';

describe('CauseValidationPipe', () => {
    let pipe: CauseValidationPipe;

    beforeEach(() => {
        pipe = new CauseValidationPipe();
    });

    it('should return value when all required fields are present', () => {
        const input: CauseFields = {
            title: 'Reforestación',
            description: 'Siembra de árboles nativos',
            address: 'Calle 10 # 20-30',
            capacity: 50,
        };

        const result = pipe.transform(input);
        expect(result).toBe(input);
    });

    it('should throw BadRequestException when title is missing', () => {
        const input = {
            title: '',
            description: 'Siembra de árboles nativos',
            address: 'Calle 10 # 20-30',
        } as CauseFields;

        expect(() => pipe.transform(input)).toThrow(BadRequestException);
        expect(() => pipe.transform(input)).toThrow('Faltan campos obligatorios para la causa');
    });

    it('should throw BadRequestException when description is missing', () => {
        const input = {
            title: 'Reforestación',
            description: '',
            address: 'Calle 10 # 20-30',
        } as CauseFields;

        expect(() => pipe.transform(input)).toThrow(BadRequestException);
        expect(() => pipe.transform(input)).toThrow('Faltan campos obligatorios para la causa');
    });

    it('should throw BadRequestException when address is missing', () => {
        const input = {
            title: 'Reforestación',
            description: 'Siembra de árboles',
            address: '',
        } as CauseFields;

        expect(() => pipe.transform(input)).toThrow(BadRequestException);
        expect(() => pipe.transform(input)).toThrow('Faltan campos obligatorios para la causa');
    });
});

