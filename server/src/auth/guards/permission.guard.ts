import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { User } from '../../users/entities/user.entity';

interface AuthenticatedUser extends Partial<User> {
    role?: any;
    permissions?: string[];
}

interface AuthenticatedRequest {
    user?: AuthenticatedUser;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // Extract required permissions from handler or controller class
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException('User is not authenticated');
        }

        // Admin role has full access
        const userRole = typeof user.role === 'string' ? user.role : user.role?.name;
        if (userRole === 'admin') {
            return true;
        }

        const userPermissions: string[] =
            user.permissions ??
            user.role?.rolePermissions
                ?.map((rp: any) => rp.permission?.name)
                .filter((p: any): p is string => Boolean(p)) ??
            [];

        const hasAllRequiredPermissions = requiredPermissions.every((permission) =>
            userPermissions.includes(permission),
        );

        if (!hasAllRequiredPermissions) {
            throw new ForbiddenException(
                `Access denied: You do not have the required permissions [${requiredPermissions.join(', ')}]`,
            );
        }

        return true;
    }
}
