import { Component, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Publicacion } from '../../models/publicacion';
import { Auth } from '../../servicios/auth';
import { NombreCompletoPipe } from '../../pipes/nombre-completo-pipe';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo-pipe';
import { BrilloHoverDirective } from '../../directivas/brillo-hover.directive';
import { ImagenRespaldoDirective } from '../../directivas/imagen-respaldo.directive';

// Tarjeta de UNA publicación. Recibe la publicación (input) y avisa al padre (output);
// no habla con el back.
@Component({
  imports: [DatePipe, RouterLink, NombreCompletoPipe, TiempoRelativoPipe, BrilloHoverDirective, ImagenRespaldoDirective],
  selector: 'app-publicacion',
  templateUrl: './publicacion.html',
  styleUrl: './publicacion.css',
})
export class PublicacionComponent {
  auth = inject(Auth);

  publicacion = input.required<Publicacion>();

  // En la página de la publicación se pasa [conEnlace]="false".
  conEnlace = input(true);

  meGustaTocado = output<Publicacion>();
  eliminarTocado = output<Publicacion>();

  carteles = {
    logro: '★ LOGRO DESBLOQUEADO',
    party: '» BUSCO PARTY',
    duda: '? PIDO AYUDA',
  };

  leDiMeGusta() {
    const miId = this.auth.usuarioActual()?._id;
    return this.publicacion().meGusta.includes(miId!);
  }

  esMia() {
    return this.auth.usuarioActual()?._id === this.publicacion().autor._id;
  }

  // El autor o un administrador (el back lo vuelve a chequear).
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
