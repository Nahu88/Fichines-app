import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { PaginaPublicaciones, Publicacion } from '../models/publicacion';

// Servicio que habla con el módulo de publicaciones del back.
// Se llama PublicacionesService (y no Publicaciones) para no confundirse con la pantalla Publicaciones.
// SPRINT 3: ya no agregamos a mano quién somos: el interceptor le pone el token a cada pedido.
@Service()
export class PublicacionesService {
  http = inject(HttpClient);

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

  // GET /publicaciones/:id (una sola, para la página de la publicación)
  buscarUna(id: string) {
    return this.http.get<Publicacion>(`${this.url}/${id}`);
  }

  // POST /publicaciones con FormData (texto + imagen opcional), igual que el registro.
  crear(datos: FormData) {
    return this.http.post<Publicacion>(this.url, datos);
  }

  eliminar(id: string) {
    return this.http.delete<{ mensaje: string }>(`${this.url}/${id}`);
  }

  darMeGusta(id: string) {
    return this.http.post<Publicacion>(`${this.url}/${id}/me-gusta`, {});
  }

  quitarMeGusta(id: string) {
    return this.http.delete<Publicacion>(`${this.url}/${id}/me-gusta`);
  }
}
