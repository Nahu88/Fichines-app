import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import type { ArchivoSubido } from '../imagenes/imagenes.service.js';

// SPRINT 2: quién hace el pedido llega en la cabecera "x-usuario-id" (el _id del usuario).
// @Headers('x-usuario-id') la lee. En el sprint 3 se reemplaza por el token JWT.
@Controller('publicaciones')
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
  crear(
    @Headers('x-usuario-id') usuarioId: string,
    @Body() datos: CrearPublicacionDto,
    @UploadedFile() imagen?: ArchivoSubido,
  ) {
    if (imagen && imagen.size > 2 * 1024 * 1024) {
      throw new BadRequestException('La imagen puede pesar hasta 2 MB');
    }
    return this.publicacionesService.crear(usuarioId, datos, imagen);
  }

  // GET /publicaciones?orden=fecha&offset=0&limit=5&usuario=<id> -> 200 OK
  // @Query() junta todos los parámetros de la URL en el DTO y los valida.
  @Get()
  listar(@Query() filtros: ListarPublicacionesDto) {
    return this.publicacionesService.listar(filtros);
  }

  // DELETE /publicaciones/:id -> 200 OK (baja lógica)
  @Delete(':id')
  eliminar(@Param('id') id: string, @Headers('x-usuario-id') usuarioId: string) {
    return this.publicacionesService.eliminar(id, usuarioId);
  }

  // POST /publicaciones/:id/me-gusta -> 201 Created (se crea un me gusta)
  @Post(':id/me-gusta')
  darMeGusta(@Param('id') id: string, @Headers('x-usuario-id') usuarioId: string) {
    return this.publicacionesService.darMeGusta(id, usuarioId);
  }

  // DELETE /publicaciones/:id/me-gusta -> 200 OK
  @Delete(':id/me-gusta')
  quitarMeGusta(@Param('id') id: string, @Headers('x-usuario-id') usuarioId: string) {
    return this.publicacionesService.quitarMeGusta(id, usuarioId);
  }
}
