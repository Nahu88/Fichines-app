import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import type { ArchivoSubido } from '../imagenes/imagenes.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(datos: RegistroDto, imagen?: ArchivoSubido) {
    const nuevo = await this.usuariosService.registrar(datos, imagen, 'usuario');
    return this.respuestaConToken(nuevo);
  }

  // Mismo mensaje si no existe el usuario o si la clave está mal, para no revelar qué cuentas existen.
  async login(datos: LoginDto) {
    const usuario = await this.usuariosService.buscarPorIdentificador(datos.identificador);

    if (!usuario || !(await bcrypt.compare(datos.password, usuario.password))) {
      throw new UnauthorizedException('Las credenciales no son correctas');
    }

    if (!usuario.activo) {
      throw new ForbiddenException('Tu cuenta está deshabilitada. Contactá a un administrador');
    }

    return this.respuestaConToken(usuario);
  }

  // El token ya lo validó el AuthGuard: devolvemos los datos actualizados del usuario.
  async autorizar(usuarioId: string) {
    const usuario = await this.usuariosService.buscarPorId(usuarioId);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Tu sesión ya no es válida. Volvé a iniciar sesión');
    }
    return this.sinPassword(usuario);
  }

  // Token nuevo con el mismo payload (sin copiar iat ni exp).
  async refrescar(payload: any) {
    const token = await this.jwtService.signAsync({
      sub: payload.sub,
      usuario: payload.usuario,
      perfil: payload.perfil,
    });
    return { token };
  }

  // El payload lleva quién es el usuario y su rol, como pide el TP.
  private async respuestaConToken(usuario: any) {
    const token = await this.jwtService.signAsync({
      sub: usuario._id.toString(),
      usuario: usuario.usuario,
      perfil: usuario.perfil,
    });
    return { usuario: this.sinPassword(usuario), token };
  }

  private sinPassword(documento: any) {
    const { password, ...resto } = documento.toObject();
    return resto;
  }
}
