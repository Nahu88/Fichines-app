import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ComentariosService } from './comentarios.service.js';
import { ComentarioDto } from './dto/comentario.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { AuthGuard } from '../guards/auth.guard.js';

// Rutas de comentarios de una publicación: /publicaciones/:publicacionId/comentarios
@Controller('publicaciones/:publicacionId/comentarios')
@UseGuards(AuthGuard)
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  // GET ?offset=0&limit=5
  @Get()
  listar(@Param('publicacionId') publicacionId: string, @Query() filtros: ListarComentariosDto) {
    return this.comentariosService.listar(publicacionId, filtros);
  }

  // POST (201) body: { "mensaje": "..." }
  @Post()
  crear(@Param('publicacionId') publicacionId: string, @Req() request: any, @Body() datos: ComentarioDto) {
    return this.comentariosService.crear(publicacionId, request.usuario.sub, datos);
  }

  // PUT /:id body: { "mensaje": "..." }
  @Put(':id')
  editar(
    @Param('publicacionId') publicacionId: string,
    @Param('id') id: string,
    @Req() request: any,
    @Body() datos: ComentarioDto,
  ) {
    return this.comentariosService.editar(publicacionId, id, request.usuario.sub, datos);
  }
}
