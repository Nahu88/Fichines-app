import { Module } from '@nestjs/common';
import { PublicacionesController } from './publicaciones.controller.js';
import { PublicacionesService } from './publicaciones.service.js';

// El schema de Publicacion y las rutas lo agrego despues.
@Module({
  controllers: [PublicacionesController],
  providers: [PublicacionesService],
})
export class PublicacionesModule {}