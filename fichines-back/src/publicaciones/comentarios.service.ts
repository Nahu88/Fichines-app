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
    private readonly publicacionesService: PublicacionesService,
  ) {}

  // Los más recientes primero, paginados.
  async listar(publicacionId: string, filtros: ListarComentariosDto) {
    await this.publicacionesService.buscarActiva(publicacionId);

    // $ne: false también incluye los comentarios viejos que no tienen el campo activo.
    const condicion = { publicacion: publicacionId, activo: { $ne: false } };

    const comentarios = await this.comentarioModel
      .find(condicion)
      .sort({ createdAt: -1 })
      .skip(filtros.offset!)
      .limit(filtros.limit!)
      .populate('autor', DATOS_AUTOR)
      .exec();

    const total = await this.comentarioModel.countDocuments(condicion);
    return { comentarios, total };
  }

  async crear(publicacionId: string, usuarioId: string, datos: ComentarioDto) {
    const publicacion = await this.publicacionesService.buscarActiva(publicacionId);

    const nuevo = await this.comentarioModel.create({
      publicacion: publicacion._id,
      autor: usuarioId,
      mensaje: datos.mensaje,
    });

    publicacion.cantidadComentarios = publicacion.cantidadComentarios + 1;
    await publicacion.save();

    return nuevo.populate('autor', DATOS_AUTOR);
  }

  // Solo lo puede editar quien lo escribió; queda marcado como modificado.
  async editar(publicacionId: string, comentarioId: string, usuarioId: string, datos: ComentarioDto) {
    const comentario = isValidObjectId(comentarioId)
      ? await this.comentarioModel.findOne({ _id: comentarioId, publicacion: publicacionId }).exec()
      : null;
    if (!comentario) {
      throw new NotFoundException('El comentario no existe');
    }

    if (!comentario.autor.equals(usuarioId)) {
      throw new ForbiddenException('Solo podés editar tus propios comentarios');
    }

    comentario.mensaje = datos.mensaje;
    comentario.modificado = true;
    await comentario.save();
    return comentario.populate('autor', DATOS_AUTOR);
  }
}
