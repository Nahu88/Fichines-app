import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../servicios/auth';
import { Modal } from '../../servicios/modal';
import { PublicacionesService } from '../../servicios/publicaciones';
import { ComentariosService } from '../../servicios/comentarios';
import { Publicacion } from '../../models/publicacion';
import { Comentario } from '../../models/comentario';
import { Navbar } from '../navbar/navbar';
import { NombreCompletoPipe } from '../../pipes/nombre-completo-pipe';
import { ImagenRespaldoDirective } from '../../directivas/imagen-respaldo.directive';
import { PublicacionComponent } from '../publicacion/publicacion';

// Datos del usuario logueado y sus últimas 3 publicaciones con sus comentarios.
@Component({
  imports: [Navbar, DatePipe, PublicacionComponent, RouterLink, NombreCompletoPipe, ImagenRespaldoDirective],
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  auth = inject(Auth);
  modal = inject(Modal);
  servicio = inject(PublicacionesService);
  comentariosService = inject(ComentariosService);

  usuario = this.auth.usuarioActual();

  ultimas = signal<Publicacion[]>([]);
  totalPublicaciones = signal(0);
  cargando = signal(true);

  // Comentarios de cada publicación, con su _id como clave.
  comentarios = signal<Record<string, Comentario[]>>({});
  porPublicacion = 3;

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.servicio.listar('fecha', 0, 3, this.usuario!._id).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        this.ultimas.set(respuesta.publicaciones);
        this.totalPublicaciones.set(respuesta.total);
        respuesta.publicaciones.forEach((publicacion) => this.cargarComentarios(publicacion));
      },
      error: (error) => {
        this.cargando.set(false);
        this.modal.mostrarErrorHttp(error);
      },
    });
  }

  cargarComentarios(publicacion: Publicacion) {
    this.comentariosService.listar(publicacion._id, 0, this.porPublicacion).subscribe({
      next: (respuesta) => {
        this.comentarios.update((lista) => ({ ...lista, [publicacion._id]: respuesta.comentarios }));
      },
      error: (error) => this.modal.mostrarErrorHttp(error),
    });
  }

  // Nivel: 5 publicaciones por nivel (20 XP cada una).
  nivel() {
    return Math.floor(this.totalPublicaciones() / 5) + 1;
  }

  xp() {
    return (this.totalPublicaciones() % 5) * 20;
  }

  fichasRecientes() {
    return this.ultimas().reduce((suma, p) => suma + p.cantidadMeGusta, 0);
  }

  // Eventos de <app-publicacion>: después de cada cambio se vuelve a cargar.
  alTocarMeGusta(publicacion: Publicacion) {
    const yaDi = publicacion.meGusta.includes(this.usuario!._id);
    const pedido = yaDi ? this.servicio.quitarMeGusta(publicacion._id) : this.servicio.darMeGusta(publicacion._id);
    pedido.subscribe({
      next: () => this.cargar(),
      error: (error) => this.modal.mostrarErrorHttp(error),
    });
  }

  alTocarEliminar(publicacion: Publicacion) {
    this.modal.confirmar('Eliminar publicación', `¿Seguro que querés eliminar "${publicacion.titulo}"?`, () => {
      this.servicio.eliminar(publicacion._id).subscribe({
        next: () => {
          this.cargar();
          this.modal.mostrar('Publicación eliminada', 'Ya no aparece en tu perfil ni en el salón.');
        },
        error: (error) => this.modal.mostrarErrorHttp(error),
      });
    });
  }
}
