import { IsNotEmpty, Matches } from 'class-validator';

// Lapso de las estadísticas: ?desde=2026-11-01&hasta=2026-11-10 (la hora la pone el service).
export class RangoFechasDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'desde tiene que tener el formato AAAA-MM-DD' })
  @IsNotEmpty({ message: 'Falta la fecha desde' })
  desde: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'hasta tiene que tener el formato AAAA-MM-DD' })
  @IsNotEmpty({ message: 'Falta la fecha hasta' })
  hasta: string;
}
