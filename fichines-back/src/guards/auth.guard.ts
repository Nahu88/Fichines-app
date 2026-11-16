import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Deja pasar solo con un token válido y no vencido (si no, 401).
// El payload del token queda en request.usuario.
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extraerToken(request);

    if (!token) {
      throw new UnauthorizedException('Tenés que iniciar sesión');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.usuario = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Tu sesión venció o no es válida. Volvé a iniciar sesión');
    }
  }

  // Cabecera "Authorization: Bearer <token>".
  private extraerToken(request: any): string | null {
    const [tipo, token] = request.headers['authorization']?.split(' ') ?? [];
    return tipo === 'Bearer' && token ? token : null;
  }
}
