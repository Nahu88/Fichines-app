import { Type } from 'class-transformer';
import { IsIn, IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

// Parámetros que puede recibir el GET /publicaciones por la URL (query), todos opcionales.
// Ejemplo: /publicaciones?orden=meGusta&offset=5&limit=5&usuario=<id>
export class ListarPublicacionesDto {
  // Cómo ordenar: por fecha (las más nuevas primero) o por cantidad de me gusta.
  @IsOptional()
  @IsIn(['fecha', 'meGusta'], { message: 'El orden tiene que ser fecha o meGusta' })
  orden?: string = 'fecha';

  // Para ver solo las publicaciones de un usuario (lo usa Mi perfil).
  @IsOptional()
  @IsMongoId({ message: 'El usuario no es válido' })
  usuario?: string;

  // Paginado: offset = cuántas saltear, limit = cuántas traer.
  // @Type(() => Number) convierte el texto de la URL en número (con transform: true).
  // (se revisan de abajo hacia arriba: primero que sea número, después el mínimo)
  @IsOptional()
  @Type(() => Number)
  @Min(0, { message: 'offset no puede ser negativo' })
  @IsInt({ message: 'offset tiene que ser un número entero' })
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @Max(20, { message: 'limit puede ser como máximo 20' })
  @Min(1, { message: 'limit tiene que ser al menos 1' })
  @IsInt({ message: 'limit tiene que ser un número entero' })
  limit?: number = 5;
}
