import { Service, signal } from '@angular/core';

// Reemplaza a alert() y confirm(): cualquier componente llama a mostrar(...) o confirmar(...)
// y el componente <app-modal> (que está en app.html) se abre solo,
// porque lee estos signals.
@Service()
export class Modal {
  abierto = signal(false);
  titulo = signal('');
  mensaje = signal('');
  tipo = signal<'exito' | 'error'>('exito');

  // Si hay una función guardada acá, el modal muestra "Cancelar" y "Sí, seguro"
  // y al confirmar la ejecuta. Si es null, es un modal común con "OK".
  alConfirmar = signal<(() => void) | null>(null);

  mostrar(titulo: string, mensaje: string, tipo: 'exito' | 'error' = 'exito') {
    this.titulo.set(titulo);
    this.mensaje.set(mensaje);
    this.tipo.set(tipo);
    this.alConfirmar.set(null);
    this.abierto.set(true);
  }

  // Pregunta antes de hacer algo (por ejemplo, eliminar una publicación).
  // accion es una función: se ejecuta solo si el usuario aprieta "Sí, seguro".
  confirmar(titulo: string, mensaje: string, accion: () => void) {
    this.titulo.set(titulo);
    this.mensaje.set(mensaje);
    this.tipo.set('error');
    this.alConfirmar.set(accion);
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

  // Botón "Sí, seguro": ejecuta la acción guardada y cierra.
  aceptar() {
    const accion = this.alConfirmar();
    this.cerrar();
    if (accion) {
      accion();
    }
  }

  cerrar() {
    this.abierto.set(false);
    this.alConfirmar.set(null);
  }
}
