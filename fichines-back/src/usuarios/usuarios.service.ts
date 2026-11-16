import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Usuario } from './entities/usuario.entity.js';
import { RegistroDto } from '../auth/dto/registro.dto.js';
import { ImagenesService } from '../imagenes/imagenes.service.js';
import type { ArchivoSubido } from '../imagenes/imagenes.service.js';

// Único servicio que habla con la colección "usuarios".
@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly imagenesService: ImagenesService,
  ) {}

  // Lo usan el registro (perfil "usuario") y el alta del administrador (elige el perfil).
  async registrar(datos: RegistroDto, imagen: ArchivoSubido | undefined, perfil: string) {
    const existente = await this.buscarPorCorreoOUsuario(datos.correo, datos.usuario);
    if (existente) {
      const campo = existente.correo === datos.correo.toLowerCase() ? 'correo' : 'nombre de usuario';
      throw new ConflictException(`Ya existe una cuenta con ese ${campo}`);
    }

    const passwordEncriptada = await bcrypt.hash(datos.password, 10);

    const imagenUrl = imagen ? await this.imagenesService.subir(imagen, 'fichines/perfiles') : '';

    return this.usuarioModel.create({
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
      usuario: datos.usuario,
      fechaNacimiento: new Date(datos.fechaNacimiento),
      descripcion: datos.descripcion ?? '',
      password: passwordEncriptada,
      imagenUrl: imagenUrl,
      perfil: perfil,
    });
  }

  listar() {
    return this.usuarioModel.find().select('-password').sort({ createdAt: -1 }).exec();
  }

  buscarPorCorreoOUsuario(correo: string, usuario: string) {
    return this.usuarioModel
      .findOne({ $or: [{ correo: correo.toLowerCase() }, { usuario: usuario }] })
      .exec();
  }

  // Para el login: el identificador puede ser el correo o el nombre de usuario.
  buscarPorIdentificador(identificador: string) {
    return this.usuarioModel
      .findOne({ $or: [{ correo: identificador.toLowerCase() }, { usuario: identificador }] })
      .exec();
  }

  buscarPorId(id: string) {
    if (!isValidObjectId(id)) return null;
    return this.usuarioModel.findById(id).exec();
  }

  // Alta y baja lógica. Un administrador no puede deshabilitarse a sí mismo.
  async cambiarActivo(id: string, activo: boolean, adminId: string) {
    if (!activo && id === adminId) {
      throw new BadRequestException('No podés deshabilitar tu propia cuenta');
    }

    const usuario = await this.buscarPorId(id);
    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }

    usuario.activo = activo;
    await usuario.save();
    return this.sinPassword(usuario);
  }

  sinPassword(documento: any) {
    const { password, ...resto } = documento.toObject();
    return resto;
  }
}
