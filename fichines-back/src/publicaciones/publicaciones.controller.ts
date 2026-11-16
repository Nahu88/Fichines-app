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

// Todas las rutas piden token. request.usuario.sub es el _id de quien hace el pedido.
@Controller('publicaciones')
@UseGuards(AuthGuard)
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  // POST /publicaciones (201): FormData con texto e imagen opcional.
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

  // GET /publicaciones?orden=fecha&offset=0&limit=5&usuario=<id>
  @Get()
  listar(@Query() filtros: ListarPublicacionesDto) {
    return this.publicacionesService.listar(filtros);
  }

  // GET /publicaciones/:id
  @Get(':id')
  buscarUna(@Param('id') id: string) {
    return this.publicacionesService.buscarUna(id);
  }

  // DELETE /publicaciones/:id (baja lógica)
  @Delete(':id')
  eliminar(@Param('id') id: string, @Req() request: any) {
    return this.publicacionesService.eliminar(id, request.usuario.sub);
  }

  // POST /publicaciones/:id/me-gusta (201)
  @Post(':id/me-gusta')
  darMeGusta(@Param('id') id: string, @Req() request: any) {
    return this.publicacionesService.darMeGusta(id, request.usuario.sub);
  }

  // DELETE /publicaciones/:id/me-gusta
  @Delete(':id/me-gusta')
  quitarMeGusta(@Param('id') id: string, @Req() request: any) {
    return this.publicacionesService.quitarMeGusta(id, request.usuario.sub);
  }
}
