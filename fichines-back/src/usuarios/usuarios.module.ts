import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosService } from './usuarios.service.js';
import { UsuariosController } from './usuarios.controller.js';
import { Usuario, UsuarioSchema } from './entities/usuario.entity.js';
import { ImagenesService } from '../imagenes/imagenes.service.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }])],
  controllers: [UsuariosController],
  providers: [UsuariosService, ImagenesService],
  // Lo usan AuthModule y PublicacionesModule.
  exports: [UsuariosService],
})
export class UsuariosModule {}