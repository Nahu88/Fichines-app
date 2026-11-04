import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesController } from './publicaciones.controller.js';
import { PublicacionesService } from './publicaciones.service.js';
import { ComentariosController } from './comentarios.controller.js';
import { ComentariosService } from './comentarios.service.js';
import { Publicacion, PublicacionSchema } from './entities/publicacion.entity.js';
import { Comentario, ComentarioSchema } from './entities/comentario.entity.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { ImagenesService } from '../imagenes/imagenes.service.js';

@Module({
  imports: [
    // Registra los modelos "Publicacion" y "Comentario" para poder usarlos con @InjectModel.
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
    // Para buscar al usuario que hace el pedido (UsuariosService está exportado ahí).
    UsuariosModule,
  ],
  // SPRINT 3: se suma el controller de comentarios dentro del mismo módulo.
  controllers: [PublicacionesController, ComentariosController],
  providers: [PublicacionesService, ComentariosService, ImagenesService],
})
export class PublicacionesModule {}
