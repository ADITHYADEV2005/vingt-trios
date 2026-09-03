import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ADMIN_ROLES_KEY = 'adminRoles';

export function AdminRoles(...roles: string[]) {
  return (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata(ADMIN_ROLES_KEY, roles, descriptor?.value || target);
    return descriptor || target;
  };
}

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(ADMIN_ROLES_KEY, context.getHandler());
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    // If no specific admin sub-role required, any ADMIN passes
    if (!requiredRoles || requiredRoles.length === 0) return true;

    // SUPER_ADMIN always passes
    if (user.adminRole === 'SUPER_ADMIN') return true;

    if (!requiredRoles.includes(user.adminRole)) {
      throw new ForbiddenException(`Required admin role: ${requiredRoles.join(' or ')}`);
    }

    return true;
  }
}
