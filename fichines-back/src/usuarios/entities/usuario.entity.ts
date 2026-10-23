import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// @Schema le dice a Mongoose que esta clase es una colección de Mongo.
// timestamps: true agrega solos los campos createdAt y updatedAt.
@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  // unique: true crea un índice en Mongo para que no se repita.
  @Prop({ required: true, unique: true, lowercase: true })
  correo: string;

  @Prop({ required: true, unique: true })
  usuario: string;

  // Acá se guarda la contraseña YA encriptada (hash), nunca la original.
  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ default: '' })
  descripcion: string;

  // URL de la imagen de perfil (la imagen en sí queda en la carpeta /uploads).
  @Prop({ default: '' })
  imagenUrl: string;

  // enum: solo acepta estos dos valores. Por defecto todos son "usuario".
  @Prop({ enum: ['usuario', 'administrador'], default: 'usuario' })
  perfil: string;

  // Para la baja lógica del sprint 4 (habilitar / deshabilitar usuarios).
  @Prop({ default: true })
  activo: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);