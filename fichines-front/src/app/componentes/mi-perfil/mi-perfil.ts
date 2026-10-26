import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Auth } from '../../servicios/auth';
import { Navbar } from '../navbar/navbar';

// SPRINT 1: muestra los datos que devolvió el login/registro.
// En el sprint 2 se suman las últimas 3 publicaciones con sus comentarios.
@Component({
  imports: [Navbar, DatePipe],
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil {
  auth = inject(Auth);

  // El usuario logueado (authGuard asegura que haya uno para entrar acá).
  usuario = this.auth.usuarioActual();
}