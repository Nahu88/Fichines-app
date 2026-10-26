import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../servicios/auth';
import { Modal } from '../../servicios/modal';
import { passwordFuerteValidator } from '../../validators/usuario.validators';
import { Emblema } from '../emblema/emblema';

@Component({
  imports: [ReactiveFormsModule, RouterLink, Emblema],
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  auth = inject(Auth);
  modal = inject(Modal);
  router = inject(Router);

  // true mientras esperamos la respuesta del back (para deshabilitar el botón)
  cargando = signal(false);

  formLogin = new FormGroup({
    identificador: new FormControl('', { validators: [Validators.required] }),
    password: new FormControl('', { validators: [Validators.required, passwordFuerteValidator()] }),
  });

  ingresar() {
    // Si el formulario tiene errores, los mostramos todos y no enviamos nada.
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    const { identificador, password } = this.formLogin.value;

    this.auth.login(identificador!, password!).subscribe({
      next: (usuario) => {
        this.cargando.set(false);
        this.auth.guardarSesion(usuario);
        this.modal.mostrar('Partida cargada', `Hola ${usuario.nombre}, el salón te estaba esperando.`);
        this.router.navigate(['/publicaciones']);
      },
      error: (error) => {
        this.cargando.set(false);
        this.modal.mostrarErrorHttp(error);
      },
    });
  }
}