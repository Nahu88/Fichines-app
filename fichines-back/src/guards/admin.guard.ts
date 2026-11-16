import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

// Solo administradores (403 si no). Va siempre después del AuthGuard, que deja el payload en request.usuario.
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request.usuario?.perfil !== 'administrador') {
      throw new ForbiddenException('Solo los administradores pueden hacer esto');
    }
    return true;
  }
}
