import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

// Lo que nos interesa del archivo que llega en el FormData
// (FileInterceptor lo deja en memoria con estos datos, entre otros).
export interface ArchivoSubido {
  buffer: Buffer;   // el contenido del archivo
  size: number;     // peso en bytes
  mimetype: string; // tipo, por ejemplo "image/png"
}

@Injectable()
export class AuthService {
  constructor(private readonly usuariosService: UsuariosService) {}

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
    const imagenUrl = imagen ? await this.subirImagen(imagen) : '';

    // 4) Guardamos. El perfil NO viene del formulario: siempre arranca como "usuario".
    const nuevo = await this.usuariosService.crear({
      ...datos,
      fechaNacimiento: new Date(datos.fechaNacimiento),
      password: passwordEncriptada,
      imagenUrl: imagenUrl,
    });

    return this.sinPassword(nuevo);
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

    return this.sinPassword(usuario);
  }

  // Sube la imagen a Cloudinary y devuelve la URL pública.
  // Cloudinary lee solo la variable CLOUDINARY_URL del .env (no hace falta configurarlo a mano).
  // upload_stream recibe el archivo en memoria (imagen.buffer); lo envolvemos en una
  // Promise para poder usar await.
  private subirImagen(imagen: ArchivoSubido): Promise<string> {
    // Cloudinary lee CLOUDINARY_URL apenas se importa, y en tu PC eso pasa ANTES de que
    // ConfigModule cargue el .env (en Vercel no pasa porque las variables ya existen).
    // config(true) le pide que vuelva a leer la variable, que a esta altura ya está cargada.
    cloudinary.config(true);
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'fichines/perfiles' }, (error, resultado) => {
          if (error || !resultado) {
            reject(new BadRequestException('No pudimos guardar la imagen. Probá con otra o más tarde'));
          } else {
            resolve(resultado.secure_url);
          }
        })
        .end(imagen.buffer);
    });
  }

  // Devuelve todos los datos del usuario MENOS la contraseña.
  // toObject() convierte el documento de Mongoose en un objeto común,
  // y con la desestructuración separamos password del resto.
  private sinPassword(documento: any) {
    const { password, ...resto } = documento.toObject();
    return resto;
  }
}