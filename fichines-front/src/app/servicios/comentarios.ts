import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { Comentario, PaginaComentarios } from '../models/comentario';

// Pedidos a /publicaciones/:id/comentarios.
@Service()
export class ComentariosService {
  http = inject(HttpClient);

  private url(publicacionId: string) {
    return `${environment.apiUrl}/publicaciones/${publicacionId}/comentarios`;
  }

  listar(publicacionId: string, offset: number, limit: number) {
    return this.http.get<PaginaComentarios>(this.url(publicacionId), { params: { offset, limit } });
  }

  crear(publicacionId: string, mensaje: string) {
    return this.http.post<Comentario>(this.url(publicacionId), { mensaje });
  }

  editar(publicacionId: string, comentarioId: string, mensaje: string) {
    return this.http.put<Comentario>(`${this.url(publicacionId)}/${comentarioId}`, { mensaje });
  }
}
