import { BadRequestException } from '@nestjs/common';
import { PhysicalAttributes, PhysicalAttributesPipe } from './physical-atribute.pipe';

describe('PhysicalAttributesPipe', () => {
    let pipe: PhysicalAttributesPipe;

    beforeEach(() => {
        pipe = new PhysicalAttributesPipe();
    });

    it('should return value when all physical attributes are valid', () => {
        const input: PhysicalAttributes = {
            bloodType: 'O+',
            size: 'M',
            height: 175,
        };

        const result = pipe.transform(input);
        expect(result).toBe(input);
    });

    it('should throw BadRequestException when any required field is missing', () => {
        const input = {
            bloodType: 'O+',
            size: '',
            height: 175,
        } as PhysicalAttributes;

        expect(() => pipe.transform(input)).toThrow(BadRequestException);
        expect(() => pipe.transform(input)).toThrow('Todos los campos (bloodType, size, height) son requeridos');
    });

    it('should throw BadRequestException when blood type is invalid', () => {
        const input: PhysicalAttributes = {
            bloodType: 'Z+',
            size: 'M',
            height: 175,
        };

        expect(() => pipe.transform(input)).toThrow(BadRequestException);
        expect(() => pipe.transform(input)).toThrow('Tipo de sangre inválido');
    });

    it('should throw BadRequestException when size is invalid', () => {
        const input: PhysicalAttributes = {
            bloodType: 'O+',
            size: 'XXXL',
            height: 175,
        };

        expect(() => pipe.transform(input)).toThrow(BadRequestException);
        expect(() => pipe.transform(input)).toThrow('Talla invalida');
    });

    it('should throw BadRequestException when height is less than 50', () => {
        const input: PhysicalAttributes = {
            bloodType: 'O+',
            size: 'M',
            height: 45,
        };

        expect(() => pipe.transform(input)).toThrow(BadRequestException);
        expect(() => pipe.transform(input)).toThrow('Altura inválida');
    });

    it('should throw BadRequestException when height is greater than 280', () => {
        const input: PhysicalAttributes = {
            bloodType: 'O+',
            size: 'M',
            height: 290,
        };

        expect(() => pipe.transform(input)).toThrow(BadRequestException);
        expect(() => pipe.transform(input)).toThrow('Altura inválida');
    });
});

