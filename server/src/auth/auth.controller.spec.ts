jest.mock('@nestjs/jwt', () => ({
    JwtService: class {
        sign = jest.fn();
    },
}));

jest.mock('@nestjs/config', () => ({
    ConfigService: class {
        get = jest.fn();
    },
}));

jest.mock('@nestjs/passport', () => ({
    AuthGuard: () => class {},
    PassportStrategy: () => class {},
}));

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: jest.Mocked<AuthService>;

    beforeEach(() => {
        authService = {
            register: jest.fn(),
            login: jest.fn(),
        } as unknown as jest.Mocked<AuthService>;

        controller = new AuthController(authService);
    });

    describe('register', () => {
        it('should delegate volunteer registration to authService and return result', async () => {
            const dto: RegisterDto = {
                name: 'Carlos Perez',
                username: 'carlosp',
                email: 'carlos@kindly.org',
                contact: '+573001234567',
                password: 'Password123!',
                role: 'volunteer',
            };
            const expectedResult = { id: 1, ...dto };
            authService.register.mockResolvedValue(expectedResult as never);

            const result = await controller.register(dto);

            expect(result).toEqual(expectedResult);
            expect(authService.register).toHaveBeenCalledWith(dto);
        });
    });

    describe('login', () => {
        it('should delegate login credentials to authService and return auth payload', async () => {
            const dto: LoginDto = {
                email: 'carlos@kindly.org',
                password: 'Password123!',
            };
            const expectedPayload = {
                message: 'User logged in successfully',
                access_token: 'jwt.token.here',
                token_type: 'Bearer',
                user: { id: 1, email: 'carlos@kindly.org', name: 'Carlos', username: 'carlosp', role: 'volunteer' },
            };
            authService.login.mockResolvedValue(expectedPayload);

            const result = await controller.login(dto);

            expect(result).toEqual(expectedPayload);
            expect(authService.login).toHaveBeenCalledWith(dto);
        });
    });

    describe('getProfile', () => {
        it('should return profile response containing user from token', () => {
            const currentUser = { id: 1, email: 'carlos@kindly.org', role: 'volunteer' };

            const result = controller.getProfile(currentUser);

            expect(result).toEqual({
                message: 'User profile retrieved successfully',
                user: currentUser,
            });
        });
    });
});
