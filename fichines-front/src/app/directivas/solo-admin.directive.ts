import { Directive, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { Auth } from '../servicios/auth';

// Directiva propia (estructural): el elemento solo existe si el usuario es administrador.
// Uso: <a *appSoloAdmin routerLink="/panel">Mostrador</a>
@Directive({
  selector: '[appSoloAdmin]',
})
export class SoloAdminDirective {
  private template = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private auth = inject(Auth);

  constructor() {
    if (this.auth.usuarioActual()?.perfil === 'administrador') {
      this.viewContainer.createEmbeddedView(this.template);
    } else {
      this.viewContainer.clear();
    }
  }
}
