import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { PaginaPublicaciones, Publicacion } from '../models/publicacion';

// Pedidos al módulo de publicaciones (el token lo agrega el interceptor).
@Service()
export class PublicacionesService {
  http = inject(HttpClient);

  url = `${environment.apiUrl}/publicaciones`;

  listar(orden: string, offset: number, limit: number, usuario?: string) {
    const params: any = { orden, offset, limit };
    if (usuario) {
      params.usuario = usuario;
    }
    return this.http.get<PaginaPublicaciones>(this.url, { params });
  }

  buscarUna(id: string) {
    return this.http.get<Publicacion>(`${this.url}/${id}`);
  }

  // FormData con texto e imagen opcional.
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
