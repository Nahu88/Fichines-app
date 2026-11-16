import { Component, inject } from '@angular/core';
import { Modal } from '../../servicios/modal';

// Dibuja lo que indica el servicio Modal.
@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class ModalComponent {
  modal = inject(Modal);
}