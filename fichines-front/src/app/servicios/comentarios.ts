import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { Comentario, PaginaComentarios } from '../models/comentario';

// Servicio que habla con el controller de comentarios del back.
// Las rutas cuelgan de una publicación: /publicaciones/:id/comentarios
@Service()
export class ComentariosService {
  http = inject(HttpClient);

  private url(publicacionId: string) {
    return `${environment.apiUrl}/publicaciones/${publicacionId}/comentarios`;
  }

  // GET con offset y limit: trae una tanda (los más recientes primero).
  listar(publicacionId: string, offset: number, limit: number) {
    return this.http.get<PaginaComentarios>(this.url(publicacionId), { params: { offset, limit } });
  }

  // POST: escribir un comentario.
  crear(publicacionId: string, mensaje: string) {
    return this.http.post<Comentario>(this.url(publicacionId), { mensaje });
  }

  // PUT: editar el mensaje de un comentario propio (el back le pone modificado: true).
  editar(publicacionId: string, comentarioId: string, mensaje: string) {
    return this.http.put<Comentario>(`${this.url(publicacionId)}/${comentarioId}`, { mensaje });
  }
}
