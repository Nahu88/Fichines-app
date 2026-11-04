import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Comentario } from './entities/comentario.entity.js';
import { ComentarioDto } from './dto/comentario.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { PublicacionesService } from './publicaciones.service.js';

const DATOS_AUTOR = 'nombre apellido usuario imagenUrl';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
    // Para chequear que la publicación exista (y sumarle 1 a cantidadComentarios).
    private readonly publicacionesService: PublicacionesService,
  ) {}

  // GET: los comentarios de una publicación, los más recientes primero, paginados.
  async listar(publicacionId: string, filtros: ListarComentariosDto) {
    await this.publicacionesService.buscarActiva(publicacionId); // 404 si no existe

    const comentarios = await this.comentarioModel
      .find({ publicacion: publicacionId })
      .sort({ createdAt: -1 })   // -1: los más nuevos arriba (lo pide el TP)
      .skip(filtros.offset!)
      .limit(filtros.limit!)
      .populate('autor', DATOS_AUTOR)
      .exec();

    const total = await this.comentarioModel.countDocuments({ publicacion: publicacionId });
    return { comentarios, total };
  }

  // POST: agrega un comentario con su autor (sale del token) y la fecha (la pone timestamps).
  async crear(publicacionId: string, usuarioId: string, datos: ComentarioDto) {
    const publicacion = await this.publicacionesService.buscarActiva(publicacionId);

    const nuevo = await this.comentarioModel.create({
      publicacion: publicacion._id,
      autor: usuarioId,
      mensaje: datos.mensaje,
    });

    // Le sumamos 1 al contador de la publicación.
    publicacion.cantidadComentarios = publicacion.cantidadComentarios + 1;
    await publicacion.save();

    return nuevo.populate('autor', DATOS_AUTOR);
  }

  // PUT: cambia el mensaje y marca modificado: true. Solo lo puede hacer quien lo escribió.
  async editar(publicacionId: string, comentarioId: string, usuarioId: string, datos: ComentarioDto) {
    const comentario = isValidObjectId(comentarioId)
      ? await this.comentarioModel.findOne({ _id: comentarioId, publicacion: publicacionId }).exec()
      : null;
    if (!comentario) {
      throw new NotFoundException('El comentario no existe');
    }

    // equals compara el _id del autor con el _id que vino en el token.
    if (!comentario.autor.equals(usuarioId)) {
      throw new ForbiddenException('Solo podés editar tus propios comentarios');
    }

    comentario.mensaje = datos.mensaje;
    comentario.modificado = true;
    await comentario.save();
    return comentario.populate('autor', DATOS_AUTOR);
  }
}
