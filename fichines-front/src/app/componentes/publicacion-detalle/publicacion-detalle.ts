import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../../servicios/auth';
import { Modal } from '../../servicios/modal';
import { PublicacionesService } from '../../servicios/publicaciones';
import { ComentariosService } from '../../servicios/comentarios';
import { Publicacion } from '../../models/publicacion';
import { Comentario } from '../../models/comentario';
import { Navbar } from '../navbar/navbar';
import { NombreCompletoPipe } from '../../pipes/nombre-completo-pipe';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo-pipe';
import { ImagenRespaldoDirective } from '../../directivas/imagen-respaldo.directive';
import { PublicacionComponent } from '../publicacion/publicacion';

// Página de una publicación (/publicaciones/:id) con sus comentarios.
@Component({
  imports: [Navbar, PublicacionComponent, ReactiveFormsModule, RouterLink, NombreCompletoPipe, TiempoRelativoPipe, ImagenRespaldoDirective],
  selector: 'app-publicacion-detalle',
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.css',
})
export class PublicacionDetalle implements OnInit {
  auth = inject(Auth);
  modal = inject(Modal);
  router = inject(Router);
  publicacionesService = inject(PublicacionesService);
  comentariosService = inject(ComentariosService);

  id = inject(ActivatedRoute).snapshot.paramMap.get('id')!;

  publicacion = signal<Publicacion | null>(null);
  comentarios = signal<Comentario[]>([]);
  totalComentarios = signal(0);
  porTanda = 5;
  cargandoComentarios = signal(false);
  enviando = signal(false);

  // _id del comentario que se está editando (null = ninguno).
  editandoId = signal<string | null>(null);
  textoEdicion = new FormControl('', { validators: [Validators.required, Validators.maxLength(500)] });

  formComentario = new FormGroup({
    mensaje: new FormControl('', { validators: [Validators.required, Validators.maxLength(500)] }),
  });

  ngOnInit() {
    this.publicacionesService.buscarUna(this.id).subscribe({
      next: (publicacion) => this.publicacion.set(publicacion),
      error: (error) => {
        this.modal.mostrarErrorHttp(error);
        this.router.navigate(['/publicaciones']);
      },
    });
    this.cargarMas();
  }

  // Trae la siguiente tanda y la agrega al final, sin borrar las anteriores.
  cargarMas() {
    this.cargandoComentarios.set(true);
    this.comentariosService.listar(this.id, this.comentarios().length, this.porTanda).subscribe({
      next: (respuesta) => {
        this.cargandoComentarios.set(false);
        this.comentarios.update((anteriores) => [...anteriores, ...respuesta.comentarios]);
        this.totalComentarios.set(respuesta.total);
      },
      error: (error) => {
        this.cargandoComentarios.set(false);
        this.modal.mostrarErrorHttp(error);
      },
    });
  }

  hayMas() {
    return this.comentarios().length < this.totalComentarios();
  }

  comentar() {
    if (this.formComentario.invalid) {
      this.formComentario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.comentariosService.crear(this.id, this.formComentario.value.mensaje!).subscribe({
      next: (nuevo) => {
        this.enviando.set(false);
        this.formComentario.reset();
        // El nuevo va primero (es el más reciente).
        this.comentarios.update((lista) => [nuevo, ...lista]);
        this.totalComentarios.update((total) => total + 1);
        this.publicacion.update((p) => (p ? { ...p, cantidadComentarios: p.cantidadComentarios + 1 } : p));
      },
      error: (error) => {
        this.enviando.set(false);
        this.modal.mostrarErrorHttp(error);
      },
    });
  }

  esMio(comentario: Comentario) {
    return comentario.autor._id === this.auth.usuarioActual()?._id;
  }

  empezarEdicion(comentario: Comentario) {
    this.editandoId.set(comentario._id);
    this.textoEdicion.setValue(comentario.mensaje);
  }

  cancelarEdicion() {
    this.editandoId.set(null);
  }

  guardarEdicion(comentario: Comentario) {
    if (this.textoEdicion.invalid) {
      this.textoEdicion.markAsTouched();
      return;
    }
    this.comentariosService.editar(this.id, comentario._id, this.textoEdicion.value!).subscribe({
      next: (editado) => {
        this.comentarios.update((lista) => lista.map((c) => (c._id === editado._id ? editado : c)));
        this.editandoId.set(null);
      },
      error: (error) => this.modal.mostrarErrorHttp(error),
    });
  }

  // Eventos de <app-publicacion>.
  alTocarMeGusta(publicacion: Publicacion) {
    const yaDi = publicacion.meGusta.includes(this.auth.usuarioActual()!._id);
    const pedido = yaDi
      ? this.publicacionesService.quitarMeGusta(publicacion._id)
      : this.publicacionesService.darMeGusta(publicacion._id);
    pedido.subscribe({
      next: (actualizada) => this.publicacion.set(actualizada),
      error: (error) => this.modal.mostrarErrorHttp(error),
    });
  }

  alTocarEliminar(publicacion: Publicacion) {
    this.modal.confirmar('Eliminar publicación', `¿Seguro que querés eliminar "${publicacion.titulo}"?`, () => {
      this.publicacionesService.eliminar(publicacion._id).subscribe({
        next: () => {
          this.router.navigate(['/publicaciones']);
          this.modal.mostrar('Publicación eliminada', 'Ya no aparece en el salón.');
        },
        error: (error) => this.modal.mostrarErrorHttp(error),
      });
    });
  }
}
