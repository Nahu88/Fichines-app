import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

// Colección "comentarios". timestamps: true agrega createdAt (la fecha del comentario).
@Schema({ timestamps: true })
export class Comentario {
  // A qué publicación pertenece (ref, como el autor de la publicación).
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Publicacion', required: true })
  publicacion: mongoose.Types.ObjectId;

  // Quién lo escribió.
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true })
  autor: mongoose.Types.ObjectId;

  @Prop({ required: true })
  mensaje: string;

  // El TP pide marcar los comentarios editados: pasa a true cuando se modifica.
  @Prop({ default: false })
  modificado: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
