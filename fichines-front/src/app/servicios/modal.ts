import { Service, signal } from '@angular/core';

// Reemplaza a alert() y confirm(): <app-modal> se abre solo leyendo estos signals.
@Service()
export class Modal {
  abierto = signal(false);
  titulo = signal('');
  mensaje = signal('');
  tipo = signal<'exito' | 'error'>('exito');

  // Si hay una acción guardada, es un modal de confirmación; si es null, uno común con "OK".
  alConfirmar = signal<(() => void) | null>(null);
  textoConfirmar = signal('SI, SEGURO');

  mostrar(titulo: string, mensaje: string, tipo: 'exito' | 'error' = 'exito') {
    this.titulo.set(titulo);
    this.mensaje.set(mensaje);
    this.tipo.set(tipo);
    this.alConfirmar.set(null);
    this.abierto.set(true);
  }

  // accion se ejecuta solo si el usuario acepta.
  confirmar(titulo: string, mensaje: string, accion: () => void, textoBoton = 'SI, SEGURO') {
    this.titulo.set(titulo);
    this.mensaje.set(mensaje);
    this.textoConfirmar.set(textoBoton);
    this.tipo.set('error');
    this.alConfirmar.set(accion);
    this.abierto.set(true);
  }

  // Muestra el mensaje de error del back (status 0 = el back no respondió).
  mostrarErrorHttp(error: any) {
    let mensaje = 'No pudimos conectar con el servidor. Probá de nuevo en un rato.';
    if (error.status !== 0 && error.error?.message) {
      const m = error.error.message;
      mensaje = Array.isArray(m) ? m.join('. ') : m;
    }
    this.mostrar('Algo salió mal', mensaje, 'error');
  }

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
