import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesController } from './publicaciones.controller.js';
import { PublicacionesService } from './publicaciones.service.js';
import { Publicacion, PublicacionSchema } from './entities/publicacion.entity.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { ImagenesService } from '../imagenes/imagenes.service.js';

@Module({
  imports: [
    // Registra el modelo "Publicacion" para poder usarlo con @InjectModel.
    MongooseModule.forFeature([{ name: Publicacion.name, schema: PublicacionSchema }]),
    // Para buscar al usuario que hace el pedido (UsuariosService está exportado ahí).
    UsuariosModule,
  ],
  controllers: [PublicacionesController],
  providers: [PublicacionesService, ImagenesService],
})
export class PublicacionesModule {}
