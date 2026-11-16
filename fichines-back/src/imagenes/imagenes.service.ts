import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

// Datos del archivo que deja FileInterceptor en memoria.
export interface ArchivoSubido {
  buffer: Buffer;
  size: number;
  mimetype: string;
}

// Sube imágenes a Cloudinary. Lo usan Auth/Usuarios (foto de perfil) y Publicaciones.
@Injectable()
export class ImagenesService {
  subir(imagen: ArchivoSubido, carpeta: string): Promise<string> {
    // Cloudinary lee CLOUDINARY_URL al importarse, antes de que se cargue el .env: la releemos acá.
    cloudinary.config(true);

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: carpeta }, (error, resultado) => {
          if (error || !resultado) {
            console.error('Error de Cloudinary:', error?.message);
            reject(new BadRequestException('No pudimos guardar la imagen. Probá con otra o más tarde'));
          } else {
            resolve(resultado.secure_url);
          }
        })
        .end(imagen.buffer);
    });
  }
}
