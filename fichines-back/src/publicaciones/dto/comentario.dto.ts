import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Lo que llega para crear O editar un comentario: solo el mensaje.
// (los decoradores se revisan de abajo hacia arriba: "es obligatorio" va al final)
export class ComentarioDto {
  @MaxLength(500, { message: 'El comentario puede tener hasta 500 caracteres' })
  @IsString({ message: 'El comentario tiene que ser texto' })
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  mensaje: string;
}
