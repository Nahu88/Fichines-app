import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../servicios/auth';
import { SoloAdminDirective } from '../../directivas/solo-admin.directive';
import { ImagenRespaldoDirective } from '../../directivas/imagen-respaldo.directive';

@Component({
  imports: [RouterLink, RouterLinkActive, SoloAdminDirective, ImagenRespaldoDirective],
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  auth = inject(Auth);
  router = inject(Router);

  salir() {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}