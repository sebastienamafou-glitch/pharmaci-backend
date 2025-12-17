import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Récupérer les rôles exigés par le décorateur @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Si aucun rôle n'est exigé, on laisse passer
    if (!requiredRoles) {
      return true;
    }

    // 2. Récupérer l'utilisateur depuis la requête (injecté par JwtGuard)
    const { user } = context.switchToHttp().getRequest();

    // 3. Vérifier si l'utilisateur a le bon rôle
    // Assurez-vous que votre User Entity a bien un champ 'role' (ce qui est le cas)
    return requiredRoles.some((role) => user.role?.toUpperCase() === role);
  }
}
