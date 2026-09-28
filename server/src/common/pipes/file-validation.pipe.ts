import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface FileValidationOptions {
    isRequired?: boolean;
    maxCount?: number;
    allowedMimeTypes?: string[];
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
    constructor(private readonly options: FileValidationOptions) {}

    transform(value: any) {
        const fileList = Array.isArray(value) ? value : [value];
        // if is required
        if (!value || (Array.isArray(value) && value.length === 0)) {
            if (this.options.isRequired) {
                throw new BadRequestException('You must select at least one file.');
            }
            return value;
        }
        // max count
        if (this.options.maxCount && fileList.length > this.options.maxCount) {
            throw new BadRequestException(`You cannot upload more than ${this.options.maxCount} files`);
        }
        // format
        if (this.options.allowedMimeTypes) {
            const invalidFile = fileList.filter((file) => !this.options.allowedMimeTypes?.includes(file.mimetype));
            if (invalidFile.length > 0) {
                throw new BadRequestException('Invalid file format');
            }
        }
        return value;
    }
}

//Para cada pipe crear validaciones en el dto : pendiente!!!
