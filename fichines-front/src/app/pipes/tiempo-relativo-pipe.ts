import { Pipe, PipeTransform } from '@angular/core';

// Pipe propio: "recién", "hace 5 min", "hace 3 h", "hace 2 días" o la fecha si pasó más de una semana.
@Pipe({
  name: 'tiempoRelativo',
})
export class TiempoRelativoPipe implements PipeTransform {
  transform(fecha: string | Date): string {
    const momento = new Date(fecha);
    const minutos = Math.floor((Date.now() - momento.getTime()) / 60000);

    if (minutos < 1) return 'recién';
    if (minutos < 60) return `hace ${minutos} min`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} h`;

    const dias = Math.floor(horas / 24);
    if (dias < 7) return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;

    return momento.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
