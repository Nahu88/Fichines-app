import { Pipe, PipeTransform } from '@angular/core';
import { Usuario } from '../models/usuario';

// Pipe propio: filtra la lista de usuarios por nombre, apellido, usuario o correo.
@Pipe({
  name: 'filtroUsuarios',
})
export class FiltroUsuariosPipe implements PipeTransform {
  transform(usuarios: Usuario[], busqueda: string): Usuario[] {
    if (!busqueda) {
      return usuarios;
    }
    const texto = busqueda.toLowerCase();
    return usuarios.filter((u) =>
      `${u.nombre} ${u.apellido} ${u.usuario} ${u.correo}`.toLowerCase().includes(texto),
    );
  }
}
