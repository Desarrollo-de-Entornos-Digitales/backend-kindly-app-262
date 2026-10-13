import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { PositiveIntPipe } from './positive-int.pipe';

describe('PositiveIntPipe', () => {
    let pipe: PositiveIntPipe;

    beforeEach(() => {
        pipe = new PositiveIntPipe();
    });

    const createMetadata = (data?: string): ArgumentMetadata => ({
        type: 'param',
        metatype: Number,
        data,
    });

    it('should transform a valid positive integer string into a number', () => {
        const result = pipe.transform('42', createMetadata('id'));
        expect(result).toBe(42);
    });

    it('should throw BadRequestException when value is not a valid integer string', () => {
        expect(() => pipe.transform('invalid', createMetadata('id'))).toThrow(BadRequestException);
    });

    it('should throw BadRequestException when value is zero', () => {
        expect(() => pipe.transform('0', createMetadata('causeId'))).toThrow(BadRequestException);
    });

    it('should throw BadRequestException when value is a negative integer', () => {
        expect(() => pipe.transform('-5', createMetadata('organizerId'))).toThrow(BadRequestException);
    });

    it('should use default id label when metadata.data is not provided', () => {
        expect(() => pipe.transform('abc', createMetadata())).toThrow(BadRequestException);
    });
});
