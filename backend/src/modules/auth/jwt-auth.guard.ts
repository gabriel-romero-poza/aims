import {
  ExecutionContext,
  Injectable,
  CanActivate,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super(); // Se crea el constructor del authguard
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request; // Se extren los datos para hacer el Log

    // Verifica si el handler o la clase es publico
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.log(`Access granted: [${method}] ${url} - Public route`);
      return true; // Permite el acceso a la ruta publica sin necesidad de autenticación
    }

    // Recupera los roles si hay, para controlar el acceso basado en roles
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (roles) {
      const user = request.user;

      // Checkea si los roles del usuario incluyen al menos uno de los roles requeridos
      const hasRole =
        user && user.roles.some((role: string) => roles.includes(role));

      if (!hasRole) {
        this.logger.warn(
          `Access denied: [${method}] ${url} - Missing required roles: ${roles}`,
        );
        return false; // Deniega el accesso si los roles no coinciden
      }
    }

    return super.canActivate(context); // Procede con la autenticación por defecto
  }
}
