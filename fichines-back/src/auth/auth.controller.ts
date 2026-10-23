import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service.js';
import type { ArchivoSubido } from './auth.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

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
}