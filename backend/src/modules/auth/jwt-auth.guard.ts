import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super(); // Initializes the base AuthGuard
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request; // Extract method and URL for logging

    // Check if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.log(`Access granted: [${method}] ${url} - Public route`);
      return true; // Allow access to public routes without authentication
    }

    // Retrieve roles if any, to enforce role-based access control
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (roles) {
      const user = request.user;

      // Check if the user's roles include at least one of the required roles
      const hasRole =
        user && user.roles.some((role: string) => roles.includes(role));

      if (!hasRole) {
        this.logger.warn(
          `Access denied: [${method}] ${url} - Missing required roles: ${roles}`,
        );
        return false; // Deny access if roles do not match
      }
    }

    // Proceed with the default JWT authentication
    return super.canActivate(context);
  }
}
