import { Service, signal } from '@angular/core';

// Reemplaza a alert(): cualquier componente llama a mostrar(...)
// y el componente <app-modal> (que está en app.html) se abre solo,
// porque lee estos signals.
@Service()
export class Modal {
  abierto = signal(false);
  titulo = signal('');
  mensaje = signal('');
  tipo = signal<'exito' | 'error'>('exito');

  mostrar(titulo: string, mensaje: string, tipo: 'exito' | 'error' = 'exito') {
    this.titulo.set(titulo);
    this.mensaje.set(mensaje);
    this.tipo.set(tipo);
    this.abierto.set(true);
  }

  // Muestra el error que devolvió el back.
  // Nest manda { message: '...' } o { message: ['...', '...'] } (validaciones).
  // Si status es 0, el back no respondió (está apagado o sin internet).
  mostrarErrorHttp(error: any) {
    let mensaje = 'No pudimos conectar con el servidor. Probá de nuevo en un rato.';
    if (error.status !== 0 && error.error?.message) {
      const m = error.error.message;
      mensaje = Array.isArray(m) ? m.join('. ') : m;
    }
    this.mostrar('Algo salió mal', mensaje, 'error');
  }

  cerrar() {
    this.abierto.set(false);
  }
}