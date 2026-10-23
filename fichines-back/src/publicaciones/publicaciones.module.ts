import { Module } from '@nestjs/common';
import { PublicacionesController } from './publicaciones.controller.js';
import { PublicacionesService } from './publicaciones.service.js';

// Módulo creado en el sprint 1 (lo pide el enunciado).
// El schema de Publicacion y las rutas se agregan en el sprint 2.
@Module({
  controllers: [PublicacionesController],
  providers: [PublicacionesService],
})
export class PublicacionesModule {}