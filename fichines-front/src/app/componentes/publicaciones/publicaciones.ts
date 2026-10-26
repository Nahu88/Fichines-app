import { Component, inject } from '@angular/core';
import { Auth } from '../../servicios/auth';
import { Navbar } from '../navbar/navbar';

// SPRINT 1: la pantalla existe y tiene su diseño, pero las publicaciones son
// datos de ejemplo. En el sprint 2 se reemplazan por las que vienen del back
// y cada publicación pasa a ser su propio componente (con input y output).
@Component({
  imports: [Navbar],
  selector: 'app-publicaciones',
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones {
  auth = inject(Auth);

  ejemplos = [
    {
      autor: 'Lu Ferreyra',
      usuario: 'luferre',
      hace: 'hace 20 min',
      titulo: 'Pasé el jefe final sin recibir daño',
      mensaje:
        'Tercer intento de la noche y salió perfecto. El truco fue esquivar siempre hacia la izquierda en la segunda fase y guardar la habilidad especial para el final.',
      fichas: 14,
      respuestas: 3,
    },
    {
      autor: 'Tomi Ruiz',
      usuario: 'tomiruiz',
      hace: 'hace 2 h',
      titulo: 'Busco party para el sábado',
      mensaje: 'Somos tres, nos falta un healer para la incursión del sábado a la noche. Paciencia garantizada.',
      fichas: 31,
      respuestas: 12,
    },
  ];

  // Primera letra del nombre, para el recuadro del autor.
  inicial(nombre: string) {
    return nombre.charAt(0).toUpperCase();
  }
}