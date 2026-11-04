import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../servicios/auth';
import { Emblema } from '../emblema/emblema';

// SPRINT 3: pantalla que se ve al abrir la app, con un spinner.
// Mientras se ve, le pregunta al back (ruta autorizar) si el token guardado sigue siendo válido:
// - si es válido  -> va al salón (publicaciones)
// - si no lo es   -> va al login
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
    // Sin token no hay nada que validar: directo al login.
    if (!this.auth.token()) {
      this.router.navigate(['/login']);
      return;
    }

    // El interceptor le agrega el token a este pedido.
    this.auth.autorizar().subscribe({
      next: (usuario) => {
        this.auth.guardarUsuario(usuario);   // datos actualizados del back
        this.auth.sesionValidada.set(true);  // así authGuard ya deja pasar
        this.auth.iniciarContador();          // programa el aviso de los 5 minutos
        this.router.navigate(['/publicaciones']);
      },
      error: () => {
        // Token vencido o inválido (401): limpiamos todo y al login.
        this.auth.cerrarSesion();
        this.router.navigate(['/login']);
      },
    });
  }
}
