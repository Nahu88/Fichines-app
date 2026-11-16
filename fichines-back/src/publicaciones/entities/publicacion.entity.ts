import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  mensaje: string;

  @Prop({ default: '' })
  imagenUrl: string;

  // Datos propios de Fichines: tipo de cartel, juego y consola.
  @Prop({ enum: ['logro', 'party', 'duda'], default: 'logro' })
  tipo: string;

  @Prop({ default: '' })
  juego: string;

  @Prop({ default: '' })
  plataforma: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true })
  autor: mongoose.Types.ObjectId;

  // _id de los usuarios que dieron me gusta.
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Usuario', default: [] })
  meGusta: mongoose.Types.ObjectId[];

  // Guardada aparte para poder ordenar por me gusta.
  @Prop({ default: 0 })
  cantidadMeGusta: number;

  @Prop({ default: 0 })
  cantidadComentarios: number;

  // Baja lógica.
  @Prop({ default: true })
  activo: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
