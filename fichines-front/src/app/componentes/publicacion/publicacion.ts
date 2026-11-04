import { Component, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Publicacion } from '../../models/publicacion';
import { Auth } from '../../servicios/auth';

// UNA publicación. Es como el CardUsuario del ejemplo "ejemploInputOutput" de la cursada:
// - input: recibe la publicación desde la pantalla que la usa (Salón o Mi perfil).
// - output: avisa a esa pantalla cuando el usuario toca "ficha" o "eliminar".
// Este componente no habla con el back: solo muestra y avisa. La pantalla padre hace el pedido.
@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-publicacion',
  templateUrl: './publicacion.html',
  styleUrl: './publicacion.css',
})
export class PublicacionComponent {
  auth = inject(Auth);

  // input.required: la pantalla padre tiene que pasarla sí o sí.
  publicacion = input.required<Publicacion>();

  // SPRINT 3: ¿mostrar el link a la página de la publicación?
  // Por defecto sí; en la propia página de la publicación se pasa [conEnlace]="false".
  conEnlace = input(true);

  // Eventos hacia el padre. Mandan la publicación para que sepa cuál fue.
  meGustaTocado = output<Publicacion>();
  eliminarTocado = output<Publicacion>();

  // Texto del cartel según el tipo.
  carteles = {
    logro: '★ LOGRO DESBLOQUEADO',
    party: '» BUSCO PARTY',
    duda: '? PIDO AYUDA',
  };

  // ¿El usuario logueado ya le dio me gusta? (su _id está en la lista meGusta)
  leDiMeGusta() {
    const miId = this.auth.usuarioActual()?._id;
    return this.publicacion().meGusta.includes(miId!);
  }

  // Puede eliminarla quien la escribió o un administrador (el back lo vuelve a chequear).
  puedoEliminar() {
    const yo = this.auth.usuarioActual();
    return yo?._id === this.publicacion().autor._id || yo?.perfil === 'administrador';
  }

  tocarMeGusta() {
    this.meGustaTocado.emit(this.publicacion());
  }

  tocarEliminar() {
    this.eliminarTocado.emit(this.publicacion());
  }
}
