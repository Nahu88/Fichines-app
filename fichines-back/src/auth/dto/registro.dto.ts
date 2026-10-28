import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

// Los decoradores de class-validator los validan solo por  el
// ValidationPipe global de main.ts. Si algo falla, Nest responde 400 Bad Request.
export class RegistroDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre tiene que ser texto' })
  nombre: string;

  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @IsString({ message: 'El apellido tiene que ser texto' })
  apellido: string;

  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @MinLength(3, { message: 'El usuario debe tener al menos 3 caracteres' })
  @MaxLength(20, { message: 'El usuario puede tener hasta 20 caracteres' })
  @Matches(/^[a-zA-Z0-9_.]+$/, { message: 'El usuario solo puede tener letras, números, punto y guion bajo' })
  usuario: string;

  // (?=.*[A-Z]) = al menos una mayúscula, (?=.*\d) = al menos un número, .{8,} = 8 o más caracteres
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'La contraseña no tiene un formato válido: debe tener al menos 8 caracteres, una mayúscula y un número',
  })
  password: string;

  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  fechaNacimiento: string;

  @IsOptional()
  @MaxLength(160, { message: 'La descripción puede tener hasta 160 caracteres' })
  descripcion?: string;
}