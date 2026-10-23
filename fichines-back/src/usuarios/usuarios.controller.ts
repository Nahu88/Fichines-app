import { Controller } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';

// Por ahora vacío: las rutas de usuarios (listar, alta, baja lógica)
// las pide el sprint 4 y son solo para administradores.
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}
}