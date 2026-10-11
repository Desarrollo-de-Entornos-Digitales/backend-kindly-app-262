import { randomUUID } from 'crypto';

export const CAUSE_QR_CODE_PREFIX = 'QR-CAUSE-';

export function generateCauseQrCode(): string {
    return `${CAUSE_QR_CODE_PREFIX}${randomUUID()}`;
}
