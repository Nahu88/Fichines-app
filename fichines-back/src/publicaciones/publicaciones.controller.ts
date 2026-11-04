import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import type { ArchivoSubido } from '../imagenes/imagenes.service.js';
import { AuthGuard } from '../guards/auth.guard.js';

// SPRINT 3: @UseGuards arriba de la clase protege TODAS las rutas del controller.
// Sin un token válido, el AuthGuard responde 401 antes de llegar a cualquier método.
// Quién hace el pedido sale del token: request.usuario.sub es su _id.
@Controller('publicaciones')
@UseGuards(AuthGuard)
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  // POST /publicaciones -> 201 Created
  // Igual que el registro: FormData con texto + imagen opcional en el campo "imagen".
  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      fileFilter: (req, archivo, callback) => {
        if (archivo.mimetype.startsWith('image/')) {
          callback(null, true);
        } else {
          callback(new BadRequestException('El archivo tiene que ser una imagen'), false);
        }
      },
    }),
  )
  crear(@Req() request: any, @Body() datos: CrearPublicacionDto, @UploadedFile() imagen?: ArchivoSubido) {
    if (imagen && imagen.size > 2 * 1024 * 1024) {
      throw new BadRequestException('La imagen puede pesar hasta 2 MB');
    }
    return this.publicacionesService.crear(request.usuario.sub, datos, imagen);
  }

  // GET /publicaciones?orden=fecha&offset=0&limit=5&usuario=<id> -> 200 OK
  // @Query() junta todos los parámetros de la URL en el DTO y los valida.
  @Get()
  listar(@Query() filtros: ListarPublicacionesDto) {
    return this.publicacionesService.listar(filtros);
  }

  // GET /publicaciones/:id -> 200 OK (una sola, para la página de la publicación)
  @Get(':id')
  buscarUna(@Param('id') id: string) {
    return this.publicacionesService.buscarUna(id);
  }

  // DELETE /publicaciones/:id -> 200 OK (baja lógica)
  @Delete(':id')
  eliminar(@Param('id') id: string, @Req() request: any) {
    return this.publicacionesService.eliminar(id, request.usuario.sub);
  }

  // POST /publicaciones/:id/me-gusta -> 201 Created (se crea un me gusta)
  @Post(':id/me-gusta')
  darMeGusta(@Param('id') id: string, @Req() request: any) {
    return this.publicacionesService.darMeGusta(id, request.usuario.sub);
  }

  // DELETE /publicaciones/:id/me-gusta -> 200 OK
  @Delete(':id/me-gusta')
  quitarMeGusta(@Param('id') id: string, @Req() request: any) {
    return this.publicacionesService.quitarMeGusta(id, request.usuario.sub);
  }
}
