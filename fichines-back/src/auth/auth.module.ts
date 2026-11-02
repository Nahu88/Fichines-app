import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { ImagenesService } from '../imagenes/imagenes.service.js';

@Module({
  // Importamos UsuariosModule para poder inyectar UsuariosService en AuthService.
  imports: [UsuariosModule],
  controllers: [AuthController],
  // ImagenesService va en providers, igual que FileService en el ejemplo de la cursada.
  providers: [AuthService, ImagenesService],
})
export class AuthModule {}
