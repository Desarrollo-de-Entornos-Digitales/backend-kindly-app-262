import { BadRequestException } from '@nestjs/common';

export class InvalidQrCodeException extends BadRequestException {
    constructor(message = 'QR code does not match any cause.', internalCode?: string) {
        super({
            error: 'Invalid QR Code',
            message,
            code: internalCode,
        });
    }
}
