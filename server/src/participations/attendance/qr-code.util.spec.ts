import { describe, it, expect } from '@jest/globals';
import { CAUSE_QR_CODE_PREFIX, generateCauseQrCode } from './qr-code.util';

describe('generateCauseQrCode', () => {
    it('returns a code with the cause qr prefix', () => {
        expect(generateCauseQrCode().startsWith(CAUSE_QR_CODE_PREFIX)).toBe(true);
    });

    it('returns a random uuid after the prefix', () => {
        const uuid = generateCauseQrCode().slice(CAUSE_QR_CODE_PREFIX.length);
        expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('returns a different code on every call', () => {
        const codes = new Set(Array.from({ length: 100 }, () => generateCauseQrCode()));
        expect(codes.size).toBe(100);
    });
});
