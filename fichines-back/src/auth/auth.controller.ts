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

  // POST /auth/registro  -> responde 201 Created (es el default de @Post)
  // FileInterceptor('imagen') toma el archivo que viene en el campo "imagen"
  // del FormData. Lo deja en memoria (archivo.buffer) y el service lo sube a Cloudinary.
  @Post('registro')
  @UseInterceptors(
    FileInterceptor('imagen', {
      fileFilter: (req, archivo, callback) => {
        // Solo dejamos pasar imágenes (image/jpeg, image/png, etc.)
        if (archivo.mimetype.startsWith('image/')) {
          callback(null, true);
        } else {
          callback(new BadRequestException('El archivo tiene que ser una imagen'), false);
        }
      },
    }),
  )
  registrar(@Body() datos: RegistroDto, @UploadedFile() imagen?: ArchivoSubido) {
    // Máximo 2 MB. Lo chequeamos acá para poder responder el error en castellano.
    if (imagen && imagen.size > 2 * 1024 * 1024) {
      throw new BadRequestException('La imagen puede pesar hasta 2 MB');
    }
    return this.authService.registrar(datos, imagen);
  }

  // POST /auth/login -> el login no "crea" nada, por eso forzamos 200 OK en vez de 201.
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() datos: LoginDto) {
    return this.authService.login(datos);
  }

  // POST /auth/autorizar -> 200 con los datos del usuario si el token es válido.
  // Si el token falta, está vencido o fue modificado, el AuthGuard responde 401 antes de llegar acá.
  // La usa la pantalla "Cargando" del front al abrir la app.
  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  autorizar(@Req() request: any) {
    // request.usuario lo dejó el AuthGuard: es el payload del token.
    return this.authService.autorizar(request.usuario.sub);
  }

  // POST /auth/refrescar -> 200 con un token NUEVO (mismos datos, otros 15 minutos).
  // También pasa por el AuthGuard: solo se puede refrescar un token que todavía es válido.
  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  refrescar(@Req() request: any) {
    return this.authService.refrescar(request.usuario);
  }
}
