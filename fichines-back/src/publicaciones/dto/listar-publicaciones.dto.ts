import { Type } from 'class-transformer';
import { IsIn, IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

// Query del GET /publicaciones: ?orden=meGusta&offset=5&limit=5&usuario=<id>
export class ListarPublicacionesDto {
  @IsOptional()
  @IsIn(['fecha', 'meGusta'], { message: 'El orden tiene que ser fecha o meGusta' })
  orden?: string = 'fecha';

  @IsOptional()
  @IsMongoId({ message: 'El usuario no es válido' })
  usuario?: string;

  // @Type convierte el texto de la URL en número.
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
