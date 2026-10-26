import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../servicios/auth';

@Component({
  imports: [RouterLink, RouterLinkActive],
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