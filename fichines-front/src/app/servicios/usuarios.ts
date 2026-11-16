import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';

// Pedidos al controller de usuarios (solo administradores).
@Service()
export class UsuariosService {
  http = inject(HttpClient);

  url = `${environment.apiUrl}/usuarios`;

  listar() {
    return this.http.get<Usuario[]>(this.url);
  }

  // FormData del registro más el perfil.
  crear(datos: FormData) {
    return this.http.post<Usuario>(this.url, datos);
  }

  // Baja lógica.
  deshabilitar(id: string) {
    return this.http.delete<Usuario>(`${this.url}/${id}`);
  }

  // Alta lógica.
  habilitar(id: string) {
    return this.http.post<Usuario>(`${this.url}/${id}/alta`, {});
  }
}
