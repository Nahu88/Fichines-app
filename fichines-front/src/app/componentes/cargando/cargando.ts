import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../servicios/auth';
import { Emblema } from '../emblema/emblema';

// Pantalla inicial: valida el token con el back y va al salón o al login.
@Component({
  imports: [Emblema],
  selector: 'app-cargando',
  templateUrl: './cargando.html',
  styleUrl: './cargando.css',
})
export class Cargando implements OnInit {
  auth = inject(Auth);
  router = inject(Router);

  ngOnInit() {
    if (!this.auth.token()) {
      this.router.navigate(['/login']);
      return;
    }

    this.auth.autorizar().subscribe({
      next: (usuario) => {
        this.auth.guardarUsuario(usuario);
        this.auth.sesionValidada.set(true);
        this.auth.iniciarContador();
        this.router.navigate(['/publicaciones']);
      },
      error: () => {
        this.auth.cerrarSesion();
        this.router.navigate(['/login']);
      },
    });
  }
}
