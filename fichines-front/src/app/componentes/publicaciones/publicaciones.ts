import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../servicios/auth';
import { Modal } from '../../servicios/modal';
import { PublicacionesService } from '../../servicios/publicaciones';
import { Publicacion } from '../../models/publicacion';
import { Navbar } from '../navbar/navbar';
import { PublicacionComponent } from '../publicacion/publicacion';

// Pantalla "Salón": formulario para publicar + listado ordenado y paginado.
// Cada publicación se dibuja con el componente <app-publicacion>.
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

  // ---------- Listado ----------
  lista = signal<Publicacion[]>([]);
  total = signal(0);         // cuántas publicaciones hay en total (lo manda el back)
  orden = signal('fecha');   // 'fecha' o 'meGusta'
  pagina = signal(1);
  porPagina = 5;
  cargando = signal(false);

  // ---------- Formulario para publicar ----------
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

  // ngOnInit se ejecuta una vez, cuando la pantalla aparece: traemos la primera página.
  ngOnInit() {
    this.cargar();
  }

  // Cantidad de páginas. Math.ceil redondea para arriba (11 publicaciones / 5 = 3 páginas).
  totalPaginas() {
    return Math.max(1, Math.ceil(this.total() / this.porPagina));
  }

  cargar() {
    this.cargando.set(true);
    // offset: cuántas saltear. Página 1 -> 0, página 2 -> 5, página 3 -> 10.
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

  // El select de orden cambió: volvemos a la página 1 con el orden nuevo.
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

  // ---------- Publicar ----------

  tieneError(campo: string, error: string) {
    const control = this.formPublicacion.get(campo);
    return control!.touched && control!.hasError(error);
  }

  // Igual que la foto de perfil del registro.
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

    // FormData porque puede ir una imagen, igual que en el registro.
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
        // Limpiamos el formulario (reset lo deja vacío; al tipo le volvemos a poner "logro").
        this.formPublicacion.reset({ tipo: 'logro', juego: '', plataforma: '' });
        this.imagen = null;
        this.nombreImagen.set('');
        // Volvemos a la página 1 ordenada por fecha para que se vea la nueva arriba de todo.
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

  // ---------- Eventos que llegan desde <app-publicacion> (output) ----------

  alTocarMeGusta(publicacion: Publicacion) {
    const miId = this.auth.usuarioActual()!._id;
    const yaDi = publicacion.meGusta.includes(miId);

    // Si ya la di, la quito; si no, la doy. Las dos devuelven la publicación actualizada.
    const pedido = yaDi ? this.servicio.quitarMeGusta(publicacion._id) : this.servicio.darMeGusta(publicacion._id);

    pedido.subscribe({
      next: (actualizada) => {
        // Reemplazamos en la lista solo la publicación que cambió.
        // map recorre la lista y devuelve una nueva con ese elemento cambiado.
        this.lista.update((lista) => lista.map((p) => (p._id === actualizada._id ? actualizada : p)));
      },
      error: (error) => this.modal.mostrarErrorHttp(error),
    });
  }

  alTocarEliminar(publicacion: Publicacion) {
    // No usamos confirm(): preguntamos con nuestro modal.
    // Le pasamos una función flecha que se ejecuta solo si el usuario confirma.
    this.modal.confirmar(
      'Eliminar publicación',
      `¿Seguro que querés eliminar "${publicacion.titulo}"?`,
      () => this.eliminar(publicacion),
    );
  }

  eliminar(publicacion: Publicacion) {
    this.servicio.eliminar(publicacion._id).subscribe({
      next: () => {
        // Si era la única de la última página, volvemos una página para no quedar en una vacía.
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
