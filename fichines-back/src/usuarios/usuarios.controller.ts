import { Controller } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';

// temporal
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}
}