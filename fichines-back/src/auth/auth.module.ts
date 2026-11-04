import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { ImagenesService } from '../imagenes/imagenes.service.js';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,                        // así el AuthGuard lo puede usar en cualquier módulo
      secret: process.env.JWT_SECRET,      // la clave con la que se firman los tokens
      // El TP pide 15 minutos ('15m'). Para probarlo en clase: '30s'
      // (el aviso sale a los 20 segundos y la sesión se cierra a los 30).
      // El front calcula el aviso y el cierre según lo que dure el token, así que solo se cambia acá.

      // signOptions: { expiresIn: '15m' }, // este seria el real
      signOptions: { expiresIn: '30s' }, // este para el test
    }),
    UsuariosModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, ImagenesService],
})
export class AuthModule {}
