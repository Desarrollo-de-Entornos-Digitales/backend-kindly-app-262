import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class PositiveIntPipe implements PipeTransform<string, number> {
    transform(value: string, metadata: ArgumentMetadata): number {
        const val = parseInt(value, 10);

        if (isNaN(val)) {
            throw new BadRequestException(`Parameter '${metadata.data ?? 'id'}' must be a valid integer.`);
        }

        if (val <= 0) {
            throw new BadRequestException(
                `Parameter '${metadata.data ?? 'id'}' must be a positive integer greater than 0.`,
            );
        }

        return val;
    }
}
