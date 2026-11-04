import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { ImagenesService } from '../imagenes/imagenes.service.js';
import type { ArchivoSubido } from '../imagenes/imagenes.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly imagenesService: ImagenesService,
    // JwtService viene de JwtModule (lo configuramos en auth.module con la clave y los 15 minutos).
    private readonly jwtService: JwtService,
  ) {}

  async registrar(datos: RegistroDto, imagen?: ArchivoSubido) {
    // 1) Correo y usuario tienen que ser únicos.
    const existente = await this.usuariosService.buscarPorCorreoOUsuario(datos.correo, datos.usuario);
    if (existente) {
      const campo = existente.correo === datos.correo.toLowerCase() ? 'correo' : 'nombre de usuario';
      // 409 Conflict: el dato es válido pero choca con algo que ya existe.
      throw new ConflictException(`Ya existe una cuenta con ese ${campo}`);
    }

    // 2) Encriptamos la contraseña. El 10 es el "costo": cuántas vueltas da el algoritmo.
    const passwordEncriptada = await bcrypt.hash(datos.password, 10);

    // 3) Si mandaron imagen, la subimos a Cloudinary y nos quedamos con su URL pública.
    const imagenUrl = imagen ? await this.imagenesService.subir(imagen, 'fichines/perfiles') : '';

    // 4) Guardamos. El perfil NO viene del formulario: siempre arranca como "usuario".
    const nuevo = await this.usuariosService.crear({
      ...datos,
      fechaNacimiento: new Date(datos.fechaNacimiento),
      password: passwordEncriptada,
      imagenUrl: imagenUrl,
    });

    // 5) SPRINT 3: devolvemos los datos del usuario Y su token.
    return this.respuestaConToken(nuevo);
  }

  async login(datos: LoginDto) {
    const usuario = await this.usuariosService.buscarPorIdentificador(datos.identificador);

    // bcrypt.compare encripta la contraseña recibida y la compara con el hash guardado.
    // Damos el MISMO mensaje si no existe el usuario o si la clave está mal,
    // así nadie puede averiguar qué cuentas existen (lo pidió el profe tal cual).
    if (!usuario || !(await bcrypt.compare(datos.password, usuario.password))) {
      throw new UnauthorizedException('Las credenciales no son correctas');
    }

    // Preparado para el sprint 4 (usuarios deshabilitados).
    if (!usuario.activo) {
      throw new ForbiddenException('Tu cuenta está deshabilitada. Contactá a un administrador');
    }

    return this.respuestaConToken(usuario);
  }

  // Ruta autorizar: el token ya lo validó el AuthGuard. Acá buscamos al usuario
  // en la base para devolver sus datos actualizados (y chequear que siga activo).
  async autorizar(usuarioId: string) {
    const usuario = await this.usuariosService.buscarPorId(usuarioId);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Tu sesión ya no es válida. Volvé a iniciar sesión');
    }
    return this.sinPassword(usuario);
  }

  // Ruta refrescar: arma un token nuevo con los MISMOS datos (payload) que el anterior.
  // El payload que llega trae además "iat" (cuándo se creó) y "exp" (cuándo vence);
  // esos no los copiamos, porque el token nuevo tiene sus propias fechas.
  async refrescar(payload: any) {
    const token = await this.jwtService.signAsync({
      sub: payload.sub,
      usuario: payload.usuario,
      perfil: payload.perfil,
    });
    return { token };
  }

  // ---------- Ayudas internas ----------

  // Crea el token. Como en el ejemplo de la cursada (generateToken), el payload lleva
  // quién es el usuario (sub = su _id, y su nombre de usuario) y su rol (perfil), como pide el TP.
  // signAsync lo firma con JWT_SECRET y le pone el vencimiento de 15 minutos.
  private async respuestaConToken(usuario: any) {
    const token = await this.jwtService.signAsync({
      sub: usuario._id.toString(),
      usuario: usuario.usuario,
      perfil: usuario.perfil,
    });
    return { usuario: this.sinPassword(usuario), token };
  }

  // Devuelve todos los datos del usuario MENOS la contraseña.
  // toObject() convierte el documento de Mongoose en un objeto común,
  // y con la desestructuración separamos password del resto.
  private sinPassword(documento: any) {
    const { password, ...resto } = documento.toObject();
    return resto;
  }
}
