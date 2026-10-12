import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: jest.Mocked<Reflector>;

    beforeEach(() => {
        reflector = {
            getAllAndOverride: jest.fn(),
        } as unknown as jest.Mocked<Reflector>;

        guard = new RolesGuard(reflector);
    });

    const createMockContext = (user?: Record<string, unknown>): ExecutionContext => {
        const mockRequest = { user };
        return {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue(mockRequest),
            }),
        } as unknown as ExecutionContext;
    };

    it('should allow access when no roles are required', () => {
        reflector.getAllAndOverride.mockReturnValue(undefined);
        const context = createMockContext();

        expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when required roles array is empty', () => {
        reflector.getAllAndOverride.mockReturnValue([]);
        const context = createMockContext();

        expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw UnauthorizedException when request has no user', () => {
        reflector.getAllAndOverride.mockReturnValue(['admin']);
        const context = createMockContext(undefined);

        expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException when user has no role property', () => {
        reflector.getAllAndOverride.mockReturnValue(['admin']);
        const context = createMockContext({});

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow access when user role is a string matching required roles', () => {
        reflector.getAllAndOverride.mockReturnValue(['volunteer', 'admin']);
        const context = createMockContext({ role: 'volunteer' });

        expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user role is an object matching required roles', () => {
        reflector.getAllAndOverride.mockReturnValue(['organizer']);
        const context = createMockContext({ role: { name: 'organizer' } });

        expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw ForbiddenException when user role does not match required roles', () => {
        reflector.getAllAndOverride.mockReturnValue(['admin']);
        const context = createMockContext({ role: 'volunteer' });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
});
