import { Component, inject } from '@angular/core';
import { Modal } from '../../servicios/modal';

// Componente visual del modal. No tiene lógica propia:
// muestra lo que dice el servicio Modal.
@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class ModalComponent {
  modal = inject(Modal);
}