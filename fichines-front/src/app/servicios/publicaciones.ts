import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { PaginaPublicaciones, Publicacion } from '../models/publicacion';
import { Auth } from './auth';

// Servicio que habla con el módulo de publicaciones del back.
// Se llama PublicacionesService (y no Publicaciones) para no confundirse con la pantalla Publicaciones.
@Service()
export class PublicacionesService {
  http = inject(HttpClient);
  auth = inject(Auth);

  url = `${environment.apiUrl}/publicaciones`;

  // GET /publicaciones?orden=...&offset=...&limit=...&usuario=...
  // params arma la parte de la URL que va después del "?".
  listar(orden: string, offset: number, limit: number, usuario?: string) {
    const params: any = { orden, offset, limit };
    if (usuario) {
      params.usuario = usuario;
    }
    return this.http.get<PaginaPublicaciones>(this.url, { params });
  }

  // POST /publicaciones con FormData (texto + imagen opcional), igual que el registro.
  crear(datos: FormData) {
    return this.http.post<Publicacion>(this.url, datos, { headers: this.cabeceras() });
  }

  eliminar(id: string) {
    return this.http.delete<{ mensaje: string }>(`${this.url}/${id}`, { headers: this.cabeceras() });
  }

  darMeGusta(id: string) {
    return this.http.post<Publicacion>(`${this.url}/${id}/me-gusta`, {}, { headers: this.cabeceras() });
  }

  quitarMeGusta(id: string) {
    return this.http.delete<Publicacion>(`${this.url}/${id}/me-gusta`, { headers: this.cabeceras() });
  }

  // SPRINT 2: le decimos al back quién somos mandando nuestro _id en una cabecera.
  // SPRINT 3: acá se va a mandar el token JWT en su lugar.
  private cabeceras() {
    return { 'x-usuario-id': this.auth.usuarioActual()?._id ?? '' };
  }
}
