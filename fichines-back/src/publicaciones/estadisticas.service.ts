import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './entities/publicacion.entity.js';
import { Comentario } from './entities/comentario.entity.js';
import { RangoFechasDto } from './dto/rango-fechas.dto.js';

// Mongo guarda en UTC: los rangos se arman en hora argentina para no mezclar días.
const ZONA = 'America/Argentina/Buenos_Aires';
const DESFASE = '-03:00';
const UN_DIA = 24 * 60 * 60 * 1000;

export interface DatosGrafico {
  etiquetas: string[];
  valores: number[];
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
  ) {}

  async publicacionesPorUsuario(rango: RangoFechasDto): Promise<DatosGrafico> {
    const { desde, hasta } = this.armarRango(rango);

    const publicaciones = await this.publicacionModel
      .find({ activo: true, createdAt: { $gte: desde, $lte: hasta } })
      .populate('autor', 'usuario')
      .exec();

    const conteo: Record<string, number> = {};
    for (const p of publicaciones) {
      const nombre = '@' + (p.autor as any).usuario;
      conteo[nombre] = (conteo[nombre] ?? 0) + 1;
    }
    return this.ordenarDeMayorAMenor(conteo);
  }

  // Incluye en 0 los días sin comentarios.
  async comentariosPorDia(rango: RangoFechasDto): Promise<DatosGrafico> {
    const { desde, hasta } = this.armarRango(rango);

    const comentarios = await this.comentarioModel
      .find({ activo: { $ne: false }, createdAt: { $gte: desde, $lte: hasta } })
      .exec();

    const conteo: Record<string, number> = {};
    for (let dia = desde.getTime(); dia <= hasta.getTime(); dia += UN_DIA) {
      conteo[this.etiquetaDia(new Date(dia))] = 0;
    }
    for (const c of comentarios) {
      const dia = this.etiquetaDia((c as any).createdAt);
      conteo[dia] = (conteo[dia] ?? 0) + 1;
    }
    return { etiquetas: Object.keys(conteo), valores: Object.values(conteo) };
  }

  async comentariosPorPublicacion(rango: RangoFechasDto): Promise<DatosGrafico> {
    const { desde, hasta } = this.armarRango(rango);

    const comentarios = await this.comentarioModel
      .find({ activo: { $ne: false }, createdAt: { $gte: desde, $lte: hasta } })
      .populate('publicacion', 'titulo activo')
      .exec();

    const conteo: Record<string, number> = {};
    for (const c of comentarios) {
      const publicacion = c.publicacion as any;
      if (!publicacion || !publicacion.activo) continue;
      conteo[publicacion.titulo] = (conteo[publicacion.titulo] ?? 0) + 1;
    }
    return this.ordenarDeMayorAMenor(conteo);
  }

  // "2026-11-10" -> desde las 00:00 hasta las 23:59 de ese día (hora argentina).
  private armarRango(rango: RangoFechasDto) {
    if (!this.existe(rango.desde) || !this.existe(rango.hasta)) {
      throw new BadRequestException('Alguna de las fechas no existe');
    }

    const desde = new Date(`${rango.desde}T00:00:00.000${DESFASE}`);
    const hasta = new Date(`${rango.hasta}T23:59:59.999${DESFASE}`);

    if (desde > hasta) {
      throw new BadRequestException('La fecha desde no puede ser posterior a la fecha hasta');
    }
    if (hasta.getTime() - desde.getTime() > 366 * UN_DIA) {
      throw new BadRequestException('El lapso puede ser de hasta un año');
    }
    return { desde, hasta };
  }

  // Detecta fechas imposibles como el 31 de febrero.
  private existe(texto: string) {
    const [anio, mes, dia] = texto.split('-').map(Number);
    const fecha = new Date(Date.UTC(anio, mes - 1, dia));
    return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia;
  }

  private etiquetaDia(fecha: Date) {
    return fecha.toLocaleDateString('es-AR', { timeZone: ZONA, day: '2-digit', month: '2-digit' });
  }

  private ordenarDeMayorAMenor(conteo: Record<string, number>): DatosGrafico {
    const pares = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
    return { etiquetas: pares.map((par) => par[0]), valores: pares.map((par) => par[1]) };
  }
}
