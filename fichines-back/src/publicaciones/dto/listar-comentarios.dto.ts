import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// Paginado de comentarios: ?offset=0&limit=5
export class ListarComentariosDto {
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
