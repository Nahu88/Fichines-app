import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Comentario {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Publicacion', required: true })
  publicacion: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true })
  autor: mongoose.Types.ObjectId;

  @Prop({ required: true })
  mensaje: string;

  // Pasa a true cuando el autor lo edita.
  @Prop({ default: false })
  modificado: boolean;

  // Pasa a false cuando se da de baja la publicación.
  @Prop({ default: true })
  activo: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
