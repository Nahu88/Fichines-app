import { Pipe, PipeTransform } from '@angular/core';

// Pipe propio: de una persona devuelve "Nombre Apellido".
@Pipe({
  name: 'nombreCompleto',
})
export class NombreCompletoPipe implements PipeTransform {
  transform(persona: { nombre: string; apellido: string } | null | undefined): string {
    if (!persona) return '';
    return `${persona.nombre} ${persona.apellido}`;
  }
}
