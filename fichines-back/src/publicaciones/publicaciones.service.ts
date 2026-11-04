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
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { ImagenesService } from '../imagenes/imagenes.service.js';
import type { ArchivoSubido } from '../imagenes/imagenes.service.js';

// Qué datos del autor mandamos junto a cada publicación (nunca la contraseña).
const DATOS_AUTOR = 'nombre apellido usuario imagenUrl';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    private readonly usuariosService: UsuariosService,
    private readonly imagenesService: ImagenesService,
  ) {}

  // ---------- Alta ----------
  async crear(usuarioId: string, datos: CrearPublicacionDto, imagen?: ArchivoSubido) {
    const usuario = await this.obtenerUsuario(usuarioId);

    const imagenUrl = imagen ? await this.imagenesService.subir(imagen, 'fichines/publicaciones') : '';

    const nueva = await this.publicacionModel.create({
      ...datos,
      imagenUrl: imagenUrl,
      autor: usuario._id,
    });

    // populate reemplaza el _id del autor por sus datos (nombre, usuario, foto).
    return nueva.populate('autor', DATOS_AUTOR);
  }

  // ---------- Listado ----------
  async listar(filtros: ListarPublicacionesDto) {
    // Solo las activas (las borradas tienen activo: false).
    const condicion: any = { activo: true };
    if (filtros.usuario) {
      condicion.autor = filtros.usuario;
    }

    // -1 = de mayor a menor. Si ordenamos por me gusta y hay empate, va primero la más nueva.
    const orden: any = filtros.orden === 'meGusta' ? { cantidadMeGusta: -1, createdAt: -1 } : { createdAt: -1 };

    const publicaciones = await this.publicacionModel
      .find(condicion)
      .sort(orden)
      .skip(filtros.offset!)   // cuántas saltear (página 2 con limit 5 -> saltea 5)
      .limit(filtros.limit!)   // cuántas traer
      .populate('autor', DATOS_AUTOR)
      .exec();

    // El total sirve en el front para saber si hay una página siguiente.
    const total = await this.publicacionModel.countDocuments(condicion);

    return { publicaciones, total };
  }

  // ---------- Una sola (para la página de la publicación) ----------
  async buscarUna(id: string) {
    const publicacion = await this.buscarActiva(id);
    return publicacion.populate('autor', DATOS_AUTOR);
  }

  // ---------- Baja lógica ----------
  async eliminar(id: string, usuarioId: string) {
    const usuario = await this.obtenerUsuario(usuarioId);
    const publicacion = await this.buscarActiva(id);

    // equals compara dos _id de Mongo (no se pueden comparar con ===).
    const esElAutor = publicacion.autor.equals(usuario._id);
    const esAdmin = usuario.perfil === 'administrador';
    if (!esElAutor && !esAdmin) {
      // 403 Forbidden: sabemos quién sos, pero no tenés permiso.
      throw new ForbiddenException('Solo podés eliminar tus propias publicaciones');
    }

    publicacion.activo = false;
    await publicacion.save();
    return { mensaje: 'Publicación eliminada' };
  }

  // ---------- Me gusta ----------
  async darMeGusta(id: string, usuarioId: string) {
    const usuario = await this.obtenerUsuario(usuarioId);
    const publicacion = await this.buscarActiva(id);

    // some devuelve true si ALGUNO de la lista cumple la condición.
    const yaDio = publicacion.meGusta.some((idUsuario) => idUsuario.equals(usuario._id));
    if (yaDio) {
      // 409 Conflict: un usuario puede dar un solo me gusta por publicación.
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

    // filter se queda con todos MENOS el de este usuario.
    publicacion.meGusta = publicacion.meGusta.filter((idUsuario) => !idUsuario.equals(usuario._id));
    publicacion.cantidadMeGusta = publicacion.meGusta.length;
    await publicacion.save();
    return publicacion.populate('autor', DATOS_AUTOR);
  }

  // ---------- Ayudas internas ----------

  // El _id del usuario viene del token (el AuthGuard ya lo validó).
  // Igual lo buscamos en la base para confirmar que sigue existiendo, que está activo
  // y para saber su perfil actual (por si un admin se lo cambió).
  private async obtenerUsuario(usuarioId: string) {
    const usuario = usuarioId ? await this.usuariosService.buscarPorId(usuarioId) : null;
    if (!usuario || !usuario.activo) {
      // 401 Unauthorized: no sabemos quién sos.
      throw new UnauthorizedException('Tenés que iniciar sesión para hacer esto');
    }
    return usuario;
  }

  // Busca una publicación que exista y no esté borrada. Si no, 404 Not Found.
  // Es pública (sin private) porque también la usa ComentariosService.
  async buscarActiva(id: string) {
    const publicacion = isValidObjectId(id) ? await this.publicacionModel.findById(id).exec() : null;
    if (!publicacion || !publicacion.activo) {
      throw new NotFoundException('La publicación no existe');
    }
    return publicacion;
  }
}
