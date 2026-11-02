import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

// Lo que nos interesa del archivo que llega en el FormData
// (FileInterceptor lo deja en memoria con estos datos, entre otros).
export interface ArchivoSubido {
  buffer: Buffer;   // el contenido del archivo
  size: number;     // peso en bytes
  mimetype: string; // tipo, por ejemplo "image/png"
}

// Sube imágenes a Cloudinary. Es como el FileService del ejemplo "cloudinary" de la cursada.
// Lo usan dos módulos: Auth (foto de perfil) y Publicaciones (imagen de la publicación),
// por eso está en un archivo aparte y no repetido en cada service.
@Injectable()
export class ImagenesService {
  // carpeta: dentro de qué carpeta de Cloudinary se guarda (ej: "fichines/perfiles").
  // upload_stream recibe el archivo en memoria (imagen.buffer); lo envolvemos en una
  // Promise para poder usar await.
  subir(imagen: ArchivoSubido, carpeta: string): Promise<string> {
    // config(true) le dice a Cloudinary que vuelva a leer la variable CLOUDINARY_URL.
    // Hace falta porque Cloudinary la lee apenas se importa, y en la PC el .env
    // se carga después (con ConfigModule), así que la primera vez no la encuentra.
    cloudinary.config(true);

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: carpeta }, (error, resultado) => {
          if (error || !resultado) {
            // El motivo real queda en la terminal (o en los Logs de Vercel) para poder revisarlo.
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
