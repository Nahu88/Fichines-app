import { Directive, ElementRef, HostListener, inject, Renderer2 } from '@angular/core';

// Directiva propia (de atributo): si la foto no carga, muestra un avatar de respaldo.
// Uso: <img appImagenRespaldo [src]="usuario.imagenUrl" />
@Directive({
  selector: 'img[appImagenRespaldo]',
})
export class ImagenRespaldoDirective {
  private el = inject(ElementRef);
  private render = inject(Renderer2);

  @HostListener('error') alFallar() {
    const respaldo = 'avatar-respaldo.svg';
    // Evita un bucle si también fallara el respaldo.
    if (!this.el.nativeElement.src.endsWith(respaldo)) {
      this.render.setAttribute(this.el.nativeElement, 'src', respaldo);
    }
  }
}
