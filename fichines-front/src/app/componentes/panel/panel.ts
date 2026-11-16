import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../servicios/auth';
import { Navbar } from '../navbar/navbar';

// Mostrador del administrador: pestañas arriba y la elegida en el <router-outlet>.
@Component({
  imports: [Navbar, RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-panel',
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel {
  auth = inject(Auth);
}
