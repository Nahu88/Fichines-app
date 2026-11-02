import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Auth } from '../../servicios/auth';
import { Modal } from '../../servicios/modal';
import { PublicacionesService } from '../../servicios/publicaciones';
import { Publicacion } from '../../models/publicacion';
import { Navbar } from '../navbar/navbar';
import { PublicacionComponent } from '../publicacion/publicacion';

// Muestra los datos del usuario logueado y sus últimas 3 publicaciones.
// Reusa el mismo componente <app-publicacion> que el Salón.
@Component({
  imports: [Navbar, DatePipe, PublicacionComponent],
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  auth = inject(Auth);
  modal = inject(Modal);
  servicio = inject(PublicacionesService);

  // El usuario logueado (authGuard asegura que haya uno para entrar acá).
  usuario = this.auth.usuarioActual();

  ultimas = signal<Publicacion[]>([]);
  totalPublicaciones = signal(0);
  cargando = signal(true);

  ngOnInit() {
    this.cargar();
  }

  // Pide al back las 3 más nuevas de ESTE usuario (filtro usuario=_id, limit=3).
  cargar() {
    this.servicio.listar('fecha', 0, 3, this.usuario!._id).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        this.ultimas.set(respuesta.publicaciones);
        this.totalPublicaciones.set(respuesta.total);
      },
      error: (error) => {
        this.cargando.set(false);
        this.modal.mostrarErrorHttp(error);
      },
    });
  }

  // ---------- Nivel del personaje ----------
  // Cada publicación da 20 XP y cada 100 XP subís de nivel (o sea, 5 publicaciones por nivel).
  nivel() {
    return Math.floor(this.totalPublicaciones() / 5) + 1;
  }

  // XP dentro del nivel actual: el resto de dividir por 5 (%), por 20.
  xp() {
    return (this.totalPublicaciones() % 5) * 20;
  }

  // Fichas (me gusta) sumadas de las últimas 3 publicaciones.
  // reduce recorre la lista acumulando un total que arranca en 0.
  fichasRecientes() {
    return this.ultimas().reduce((suma, p) => suma + p.cantidadMeGusta, 0);
  }

  // ---------- Eventos de <app-publicacion> ----------
  // Igual que en el Salón, pero acá después de cada cambio volvemos a cargar.
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
