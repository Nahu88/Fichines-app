import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true, unique: true, lowercase: true })
  correo: string;

  @Prop({ required: true, unique: true })
  usuario: string;

  // Siempre encriptada (hash de bcrypt).
  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ default: '' })
  descripcion: string;

  // URL de Cloudinary.
  @Prop({ default: '' })
  imagenUrl: string;

  @Prop({ enum: ['usuario', 'administrador'], default: 'usuario' })
  perfil: string;

  // Baja lógica.
  @Prop({ default: true })
  activo: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);