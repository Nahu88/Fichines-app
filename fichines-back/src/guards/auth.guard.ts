import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Igual que el AuthGuard del ejemplo "jwt" de la cursada.
// Se pone arriba de una ruta con @UseGuards(AuthGuard) y se ejecuta ANTES del método:
// si el token es válido deja pasar; si no, responde 401 Unauthorized.
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
      // verify revisa la firma del token (que no lo hayan tocado) y que no esté vencido.
      // Si está todo bien, devuelve lo que guardamos adentro (el payload).
      const payload = this.jwtService.verify(token);

      // Lo dejamos en el request para que el controller sepa quién hizo el pedido.
      // (en el ejemplo de la cursada se llama "user"; acá "usuario")
      request.usuario = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Tu sesión venció o no es válida. Volvé a iniciar sesión');
    }
  }

  // El front manda el token en la cabecera: "Authorization: Bearer eyJhbGciOi..."
  // split(' ') separa "Bearer" del token, y [1] se queda con el token.
  // Es el método extractToken del ejemplo de la cursada.
  private extraerToken(request: any): string | null {
    const [tipo, token] = request.headers['authorization']?.split(' ') ?? [];
    return tipo === 'Bearer' && token ? token : null;
  }
}
