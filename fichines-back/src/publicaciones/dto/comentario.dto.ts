import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Para crear o editar un comentario.
export class ComentarioDto {
  @MaxLength(500, { message: 'El comentario puede tener hasta 500 caracteres' })
  @IsString({ message: 'El comentario tiene que ser texto' })
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  mensaje: string;
}
