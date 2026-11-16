import { IsIn } from 'class-validator';
import { RegistroDto } from '../../auth/dto/registro.dto.js';

// Alta del administrador: los mismos campos del registro, más el perfil.
export class CrearUsuarioDto extends RegistroDto {
  @IsIn(['usuario', 'administrador'], { message: 'El perfil tiene que ser usuario o administrador' })
  perfil: string;
}
