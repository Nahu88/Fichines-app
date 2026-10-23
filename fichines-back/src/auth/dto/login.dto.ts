import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  // Puede ser el correo o el nombre de usuario.
  @IsNotEmpty({ message: 'Ingresá tu correo o usuario' })
  identificador: string;

  @IsNotEmpty({ message: 'Ingresá tu contraseña' })
  password: string;
}