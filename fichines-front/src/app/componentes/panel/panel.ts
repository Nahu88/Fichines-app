import { Component, inject } from '@angular/core';
import { Auth } from '../../servicios/auth';
import { Navbar } from '../navbar/navbar';

// Panel del administrador. SPRINT 1: la pantalla existe y está protegida
// con adminGuard. Las secciones de usuarios y estadísticas llegan en el sprint 4.
@Component({
  imports: [Navbar],
  selector: 'app-panel',
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel {
  auth = inject(Auth);
}