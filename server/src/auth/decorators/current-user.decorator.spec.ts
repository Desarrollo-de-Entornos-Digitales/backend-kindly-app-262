import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { ExecutionContext } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';

describe('CurrentUserDecorator', () => {
    function getParamDecoratorFactory(decorator: (...args: unknown[]) => ParameterDecorator) {
        class TestClass {
            public testMethod(@decorator() value: unknown) {
                return value;
            }
        }
        const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestClass, 'testMethod');
        const key = Object.keys(args)[0];
        return args[key].factory as (data: string | undefined, ctx: ExecutionContext) => unknown;
    }

    const factory = getParamDecoratorFactory(CurrentUser);

    const createMockContext = (user?: Record<string, unknown>): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({ user }),
            }),
        } as unknown as ExecutionContext;
    };

    it('should return the full user object when data parameter is undefined', () => {
        const mockUser = { id: 1, email: 'user@kindly.org' };
        const ctx = createMockContext(mockUser);

        const result = factory(undefined, ctx);

        expect(result).toEqual(mockUser);
    });

    it('should return specific user property when data parameter is provided', () => {
        const mockUser = { id: 1, email: 'user@kindly.org' };
        const ctx = createMockContext(mockUser);

        const result = factory('email', ctx);

        expect(result).toBe('user@kindly.org');
    });

    it('should return undefined when user is undefined in request', () => {
        const ctx = createMockContext(undefined);

        const result = factory('id', ctx);

        expect(result).toBeUndefined();
    });
});
