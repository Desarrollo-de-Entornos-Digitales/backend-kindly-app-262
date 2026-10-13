import { BadRequestException } from '@nestjs/common';
import { FileValidationPipe } from './file-validation.pipe';

describe('FileValidationPipe', () => {
    it('should throw BadRequestException when file is missing and isRequired is true', () => {
        const pipe = new FileValidationPipe({ isRequired: true });

        expect(() => pipe.transform(null)).toThrow(BadRequestException);
        expect(() => pipe.transform(null)).toThrow('Debes seleccionar al menos un archivo');
    });

    it('should throw BadRequestException when file array is empty and isRequired is true', () => {
        const pipe = new FileValidationPipe({ isRequired: true });

        expect(() => pipe.transform([])).toThrow(BadRequestException);
        expect(() => pipe.transform([])).toThrow('Debes seleccionar al menos un archivo');
    });

    it('should return null when file is missing and isRequired is false', () => {
        const pipe = new FileValidationPipe({ isRequired: false });

        expect(pipe.transform(null)).toBeNull();
    });

    it('should throw BadRequestException when file count exceeds maxCount', () => {
        const pipe = new FileValidationPipe({ maxCount: 2 });
        const files = [{ mimetype: 'image/png' }, { mimetype: 'image/png' }, { mimetype: 'image/png' }];

        expect(() => pipe.transform(files)).toThrow(BadRequestException);
        expect(() => pipe.transform(files)).toThrow('No puedes subir mas de 2 archivos');
    });

    it('should throw BadRequestException when file mime type is not allowed', () => {
        const pipe = new FileValidationPipe({ allowedMimeTypes: ['image/png', 'image/jpeg'] });
        const file = { mimetype: 'application/pdf' };

        expect(() => pipe.transform(file)).toThrow(BadRequestException);
        expect(() => pipe.transform(file)).toThrow('Formato de archivo inválido');
    });

    it('should return file when it meets all criteria', () => {
        const pipe = new FileValidationPipe({
            isRequired: true,
            maxCount: 2,
            allowedMimeTypes: ['image/png', 'image/jpeg'],
        });
        const file = { mimetype: 'image/png' };

        const result = pipe.transform(file);
        expect(result).toBe(file);
    });

    it('should return file array when it meets all criteria', () => {
        const pipe = new FileValidationPipe({
            isRequired: true,
            maxCount: 2,
            allowedMimeTypes: ['image/png'],
        });
        const files = [{ mimetype: 'image/png' }];

        const result = pipe.transform(files);
        expect(result).toBe(files);
    });
});
