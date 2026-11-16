import { Directive, ElementRef, HostListener, inject, Input, Renderer2 } from '@angular/core';

// Directiva propia (de atributo): al pasar el mouse, el elemento se levanta y brilla.
// Uso: <article appBrilloHover> o con color: <article appBrilloHover="#8f87d9">
@Directive({
  selector: '[appBrilloHover]',
})
export class BrilloHoverDirective {
  // Color del brillo (dorado si no se pasa).
  @Input() appBrilloHover = '';

  private el = inject(ElementRef);
  private render = inject(Renderer2);

  @HostListener('mouseenter') alEntrar() {
    const color = this.appBrilloHover || '#f0b429';
    this.render.setStyle(this.el.nativeElement, 'transition', 'transform 0.15s, box-shadow 0.15s');
    this.render.setStyle(this.el.nativeElement, 'transform', 'translateY(-3px)');
    this.render.setStyle(this.el.nativeElement, 'box-shadow', `6px 6px 0 rgba(0,0,0,0.35), 0 0 18px ${color}`);
  }

  @HostListener('mouseleave') alSalir() {
    this.render.removeStyle(this.el.nativeElement, 'transform');
    this.render.removeStyle(this.el.nativeElement, 'box-shadow');
  }
}
