import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../servicios/auth';
import { Modal } from '../../servicios/modal';
import { PublicacionesService } from '../../servicios/publicaciones';
import { Publicacion } from '../../models/publicacion';
import { Navbar } from '../navbar/navbar';
import { PublicacionComponent } from '../publicacion/publicacion';

// Salón: formulario para publicar y listado ordenado y paginado.
@Component({
  imports: [Navbar, PublicacionComponent, ReactiveFormsModule],
  selector: 'app-publicaciones',
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  auth = inject(Auth);
  modal = inject(Modal);
  servicio = inject(PublicacionesService);

  lista = signal<Publicacion[]>([]);
  total = signal(0);
  orden = signal('fecha');
  pagina = signal(1);
  porPagina = 5;
  cargando = signal(false);

  publicando = signal(false);
  imagen: File | null = null;
  nombreImagen = signal('');

  plataformas = ['PC', 'PS5', 'PS4', 'Xbox', 'Switch', 'Celular', 'Retro'];

  formPublicacion = new FormGroup({
    titulo: new FormControl('', { validators: [Validators.required, Validators.maxLength(80)] }),
    mensaje: new FormControl('', { validators: [Validators.required, Validators.maxLength(1000)] }),
    tipo: new FormControl('logro'),
    juego: new FormControl('', { validators: [Validators.maxLength(60)] }),
    plataforma: new FormControl(''),
  });

  ngOnInit() {
    this.cargar();
  }

  totalPaginas() {
    return Math.max(1, Math.ceil(this.total() / this.porPagina));
  }

  cargar() {
    this.cargando.set(true);
    const offset = (this.pagina() - 1) * this.porPagina;

    this.servicio.listar(this.orden(), offset, this.porPagina).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        this.lista.set(respuesta.publicaciones);
        this.total.set(respuesta.total);
      },
      error: (error) => {
        this.cargando.set(false);
        this.modal.mostrarErrorHttp(error);
      },
    });
  }

  cambiarOrden(evento: Event) {
    const select = evento.target as HTMLSelectElement;
    this.orden.set(select.value);
    this.pagina.set(1);
    this.cargar();
  }

  anterior() {
    this.pagina.update((p) => p - 1);
    this.cargar();
  }

  siguiente() {
    this.pagina.update((p) => p + 1);
    this.cargar();
  }

  tieneError(campo: string, error: string) {
    const control = this.formPublicacion.get(campo);
    return control!.touched && control!.hasError(error);
  }

  elegirImagen(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      this.modal.mostrar('Ese archivo no sirve', 'Elegí una imagen (JPG, PNG o WEBP).', 'error');
      input.value = '';
      return;
    }
    if (archivo.size > 2 * 1024 * 1024) {
      this.modal.mostrar('Imagen muy pesada', 'La imagen puede pesar hasta 2 MB.', 'error');
      input.value = '';
      return;
    }

    this.imagen = archivo;
    this.nombreImagen.set(archivo.name);
  }

  publicar() {
    if (this.formPublicacion.invalid) {
      this.formPublicacion.markAllAsTouched();
      return;
    }

    const valores = this.formPublicacion.value;
    const datos = new FormData();
    datos.append('titulo', valores.titulo!);
    datos.append('mensaje', valores.mensaje!);
    datos.append('tipo', valores.tipo!);
    datos.append('juego', valores.juego || '');
    datos.append('plataforma', valores.plataforma || '');
    if (this.imagen) {
      datos.append('imagen', this.imagen);
    }

    this.publicando.set(true);
    this.servicio.crear(datos).subscribe({
      next: () => {
        this.publicando.set(false);
        this.formPublicacion.reset({ tipo: 'logro', juego: '', plataforma: '' });
        this.imagen = null;
        this.nombreImagen.set('');
        // Vuelve a la primera página por fecha para que se vea la nueva arriba.
        this.orden.set('fecha');
        this.pagina.set(1);
        this.cargar();
        this.modal.mostrar('Publicado', 'Tu publicación ya está en el salón.');
      },
      error: (error) => {
        this.publicando.set(false);
        this.modal.mostrarErrorHttp(error);
      },
    });
  }

  // Eventos que llegan desde <app-publicacion>.
  alTocarMeGusta(publicacion: Publicacion) {
    const miId = this.auth.usuarioActual()!._id;
    const yaDi = publicacion.meGusta.includes(miId);

    const pedido = yaDi ? this.servicio.quitarMeGusta(publicacion._id) : this.servicio.darMeGusta(publicacion._id);

    pedido.subscribe({
      next: (actualizada) => {
        this.lista.update((lista) => lista.map((p) => (p._id === actualizada._id ? actualizada : p)));
      },
      error: (error) => this.modal.mostrarErrorHttp(error),
    });
  }

  alTocarEliminar(publicacion: Publicacion) {
    this.modal.confirmar(
      'Eliminar publicación',
      `¿Seguro que querés eliminar "${publicacion.titulo}"?`,
      () => this.eliminar(publicacion),
    );
  }

  eliminar(publicacion: Publicacion) {
    this.servicio.eliminar(publicacion._id).subscribe({
      next: () => {
        // Si era la única de la última página, vuelve a la anterior.
        if (this.lista().length === 1 && this.pagina() > 1) {
          this.pagina.update((p) => p - 1);
        }
        this.cargar();
        this.modal.mostrar('Publicación eliminada', 'Ya no aparece en el salón.');
      },
      error: (error) => this.modal.mostrarErrorHttp(error),
    });
  }
}
