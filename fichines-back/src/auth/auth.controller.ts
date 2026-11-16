import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service.js';
import type { ArchivoSubido } from '../imagenes/imagenes.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthGuard } from '../guards/auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/registro (201). La imagen llega en el campo "imagen" del FormData.
  @Post('registro')
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
  registrar(@Body() datos: RegistroDto, @UploadedFile() imagen?: ArchivoSubido) {
    if (imagen && imagen.size > 2 * 1024 * 1024) {
      throw new BadRequestException('La imagen puede pesar hasta 2 MB');
    }
    return this.authService.registrar(datos, imagen);
  }

  // POST /auth/login (200: el login no crea nada).
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() datos: LoginDto) {
    return this.authService.login(datos);
  }

  // POST /auth/autorizar: 200 con el usuario si el token es válido, 401 si no.
  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  autorizar(@Req() request: any) {
    return this.authService.autorizar(request.usuario.sub);
  }

  // POST /auth/refrescar: token nuevo, solo si el actual todavía es válido.
  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  refrescar(@Req() request: any) {
    return this.authService.refrescar(request.usuario);
  }
}
