import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// Datos que llegan para crear una publicación (por FormData, porque puede traer imagen).
// El autor NO viene acá: lo sacamos de la cabecera del usuario (ver el controller).
// OJO con el orden: class-validator revisa los decoradores de ABAJO hacia ARRIBA, y con
// stopAtFirstError se queda con el primer error. Por eso "es obligatorio" va al final.
export class CrearPublicacionDto {
  @MaxLength(80, { message: 'El título puede tener hasta 80 caracteres' })
  @IsString({ message: 'El título tiene que ser texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  titulo: string;

  @MaxLength(1000, { message: 'El mensaje puede tener hasta 1000 caracteres' })
  @IsString({ message: 'El mensaje tiene que ser texto' })
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  mensaje: string;

  @IsOptional()
  @IsIn(['logro', 'party', 'duda'], { message: 'El tipo tiene que ser logro, party o duda' })
  tipo?: string;

  @IsOptional()
  @MaxLength(60, { message: 'El nombre del juego puede tener hasta 60 caracteres' })
  juego?: string;

  @IsOptional()
  @MaxLength(30, { message: 'La plataforma puede tener hasta 30 caracteres' })
  plataforma?: string;
}
