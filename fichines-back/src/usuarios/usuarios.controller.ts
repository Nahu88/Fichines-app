import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import type { ArchivoSubido } from '../imagenes/imagenes.service.js';
import { AuthGuard } from '../guards/auth.guard.js';
import { AdminGuard } from '../guards/admin.guard.js';

// Solo administradores: primero valida el token y después el perfil.
@Controller('usuarios')
@UseGuards(AuthGuard, AdminGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // GET /usuarios
  @Get()
  listar() {
    return this.usuariosService.listar();
  }

  // POST /usuarios (201): igual que el registro, más el perfil.
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
  async crear(@Body() datos: CrearUsuarioDto, @UploadedFile() imagen?: ArchivoSubido) {
    if (imagen && imagen.size > 2 * 1024 * 1024) {
      throw new BadRequestException('La imagen puede pesar hasta 2 MB');
    }
    const nuevo = await this.usuariosService.registrar(datos, imagen, datos.perfil);
    return this.usuariosService.sinPassword(nuevo);
  }

  // DELETE /usuarios/:id: baja lógica (no va a poder iniciar sesión).
  @Delete(':id')
  deshabilitar(@Param('id') id: string, @Req() request: any) {
    return this.usuariosService.cambiarActivo(id, false, request.usuario.sub);
  }

  // POST /usuarios/:id/alta: alta lógica.
  @Post(':id/alta')
  @HttpCode(HttpStatus.OK)
  habilitar(@Param('id') id: string, @Req() request: any) {
    return this.usuariosService.cambiarActivo(id, true, request.usuario.sub);
  }
}
