import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      // El TP pide '15m'. Para probarlo en clase, '30s' (el front calcula el aviso solo).
      // signOptions: { expiresIn: '15m' }, // este es el real (lo que pide el TP)
      signOptions: { expiresIn: '30s' }, // este para el test en clase
    }),
    UsuariosModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
