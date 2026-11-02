import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

// Colección "publicaciones". timestamps: true agrega createdAt (la fecha de la publicación).
@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  mensaje: string;

  // URL de Cloudinary. Vacía si la publicación no tiene imagen.
  @Prop({ default: '' })
  imagenUrl: string;

  // Datos propios de Fichines: el cartel (logro / party / duda), el juego y la consola.
  @Prop({ enum: ['logro', 'party', 'duda'], default: 'logro' })
  tipo: string;

  @Prop({ default: '' })
  juego: string;

  @Prop({ default: '' })
  plataforma: string;

  // Quién la escribió. Guardamos el _id del usuario y con ref: 'Usuario' Mongoose
  // sabe a qué colección apunta. Después, con populate('autor'), trae sus datos.
  // Es lo mismo que hace Alumno con sus materias en el ejemplo mongo-test de la cursada.
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true })
  autor: mongoose.Types.ObjectId;

  // Lista de los _id de los usuarios que le dieron me gusta.
  // Al ser una lista, es fácil chequear que cada usuario dé UN solo me gusta.
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Usuario', default: [] })
  meGusta: mongoose.Types.ObjectId[];

  // La cantidad de me gusta, guardada aparte para poder ORDENAR por este número.
  @Prop({ default: 0 })
  cantidadMeGusta: number;

  // Baja lógica: al "borrar" no se elimina de la base, se pone en false.
  @Prop({ default: true })
  activo: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
