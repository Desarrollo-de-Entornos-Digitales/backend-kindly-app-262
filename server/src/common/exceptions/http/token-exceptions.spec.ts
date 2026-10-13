import { HttpStatus } from '@nestjs/common';
import { InvalidTokenException } from './invalid-token.exception';
import { TokenExpiredException } from './token-expired.exception';
import { TokenMissingException } from './token-missing.exception';

describe('Token Exceptions', () => {
    describe('InvalidTokenException', () => {
        it('should create with default message and status 401', () => {
            const exception = new InvalidTokenException();
            expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
            const response = exception.getResponse() as Record<string, unknown>;
            expect(response.error).toBe('Invalid Token');
            expect(response.message).toBe('Invalid or malformed token.');
            expect(response.code).toBeUndefined();
        });

        it('should create with custom message and code', () => {
            const exception = new InvalidTokenException('Custom error', 'ERR_INVALID');
            expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
            const response = exception.getResponse() as Record<string, unknown>;
            expect(response.message).toBe('Custom error');
            expect(response.code).toBe('ERR_INVALID');
        });
    });

    describe('TokenExpiredException', () => {
        it('should create with default message and status 401', () => {
            const exception = new TokenExpiredException();
            expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
            const response = exception.getResponse() as Record<string, unknown>;
            expect(response.error).toBe('Token Expired');
            expect(response.message).toBe('Token has expired.');
            expect(response.code).toBeUndefined();
        });

        it('should create with custom message and code', () => {
            const exception = new TokenExpiredException('Token expired at midnight', 'ERR_EXPIRED');
            expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
            const response = exception.getResponse() as Record<string, unknown>;
            expect(response.message).toBe('Token expired at midnight');
            expect(response.code).toBe('ERR_EXPIRED');
        });
    });

    describe('TokenMissingException', () => {
        it('should create with default message and status 401', () => {
            const exception = new TokenMissingException();
            expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
            const response = exception.getResponse() as Record<string, unknown>;
            expect(response.error).toBe('Token Missing');
            expect(response.message).toBe('Authentication token is missing.');
            expect(response.code).toBeUndefined();
        });

        it('should create with custom message and code', () => {
            const exception = new TokenMissingException('Bearer token missing in header', 'ERR_MISSING');
            expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
            const response = exception.getResponse() as Record<string, unknown>;
            expect(response.message).toBe('Bearer token missing in header');
            expect(response.code).toBe('ERR_MISSING');
        });
    });
});

