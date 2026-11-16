import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Publicacion } from './entities/publicacion.entity.js';
import { Comentario } from './entities/comentario.entity.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { ImagenesService } from '../imagenes/imagenes.service.js';
import type { ArchivoSubido } from '../imagenes/imagenes.service.js';

// Datos del autor que se mandan con cada publicación (nunca la contraseña).
const DATOS_AUTOR = 'nombre apellido usuario imagenUrl';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
    private readonly usuariosService: UsuariosService,
    private readonly imagenesService: ImagenesService,
  ) {}

  async crear(usuarioId: string, datos: CrearPublicacionDto, imagen?: ArchivoSubido) {
    const usuario = await this.obtenerUsuario(usuarioId);

    const imagenUrl = imagen ? await this.imagenesService.subir(imagen, 'fichines/publicaciones') : '';

    const nueva = await this.publicacionModel.create({
      ...datos,
      imagenUrl: imagenUrl,
      autor: usuario._id,
    });

    return nueva.populate('autor', DATOS_AUTOR);
  }

  async listar(filtros: ListarPublicacionesDto) {
    const condicion: any = { activo: true };
    if (filtros.usuario) {
      condicion.autor = filtros.usuario;
    }

    // Por me gusta (y si empatan, la más nueva primero) o por fecha.
    const orden: any = filtros.orden === 'meGusta' ? { cantidadMeGusta: -1, createdAt: -1 } : { createdAt: -1 };

    const publicaciones = await this.publicacionModel
      .find(condicion)
      .sort(orden)
      .skip(filtros.offset!)
      .limit(filtros.limit!)
      .populate('autor', DATOS_AUTOR)
      .exec();

    const total = await this.publicacionModel.countDocuments(condicion);

    return { publicaciones, total };
  }

  async buscarUna(id: string) {
    const publicacion = await this.buscarActiva(id);
    return publicacion.populate('autor', DATOS_AUTOR);
  }

  // Baja lógica: solo el autor o un administrador. También da de baja sus comentarios.
  async eliminar(id: string, usuarioId: string) {
    const usuario = await this.obtenerUsuario(usuarioId);
    const publicacion = await this.buscarActiva(id);

    const esElAutor = publicacion.autor.equals(usuario._id);
    const esAdmin = usuario.perfil === 'administrador';
    if (!esElAutor && !esAdmin) {
      throw new ForbiddenException('Solo podés eliminar tus propias publicaciones');
    }

    publicacion.activo = false;
    await publicacion.save();

    await this.comentarioModel.updateMany({ publicacion: publicacion._id }, { activo: false });

    return { mensaje: 'Publicación eliminada' };
  }

  // Un usuario puede dar un solo me gusta por publicación.
  async darMeGusta(id: string, usuarioId: string) {
    const usuario = await this.obtenerUsuario(usuarioId);
    const publicacion = await this.buscarActiva(id);

    const yaDio = publicacion.meGusta.some((idUsuario) => idUsuario.equals(usuario._id));
    if (yaDio) {
      throw new ConflictException('Ya le diste me gusta a esta publicación');
    }

    publicacion.meGusta.push(usuario._id);
    publicacion.cantidadMeGusta = publicacion.meGusta.length;
    await publicacion.save();
    return publicacion.populate('autor', DATOS_AUTOR);
  }

  async quitarMeGusta(id: string, usuarioId: string) {
    const usuario = await this.obtenerUsuario(usuarioId);
    const publicacion = await this.buscarActiva(id);

    const yaDio = publicacion.meGusta.some((idUsuario) => idUsuario.equals(usuario._id));
    if (!yaDio) {
      throw new BadRequestException('No le habías dado me gusta a esta publicación');
    }

    publicacion.meGusta = publicacion.meGusta.filter((idUsuario) => !idUsuario.equals(usuario._id));
    publicacion.cantidadMeGusta = publicacion.meGusta.length;
    await publicacion.save();
    return publicacion.populate('autor', DATOS_AUTOR);
  }

  // Busca al usuario del token para confirmar que sigue activo y saber su perfil actual.
  private async obtenerUsuario(usuarioId: string) {
    const usuario = usuarioId ? await this.usuariosService.buscarPorId(usuarioId) : null;
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Tenés que iniciar sesión para hacer esto');
    }
    return usuario;
  }

  // Publicación que exista y no esté dada de baja (si no, 404). También la usa ComentariosService.
  async buscarActiva(id: string) {
    const publicacion = isValidObjectId(id) ? await this.publicacionModel.findById(id).exec() : null;
    if (!publicacion || !publicacion.activo) {
      throw new NotFoundException('La publicación no existe');
    }
    return publicacion;
  }
}
