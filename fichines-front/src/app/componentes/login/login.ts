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

  cargando = signal(false);

  formLogin = new FormGroup({
    identificador: new FormControl('', { validators: [Validators.required] }),
    password: new FormControl('', { validators: [Validators.required, passwordFuerteValidator()] }),
  });

  ingresar() {
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    const { identificador, password } = this.formLogin.value;

    this.auth.login(identificador!, password!).subscribe({
      // Llega { usuario, token }.
      next: (respuesta) => {
        this.cargando.set(false);
        this.auth.iniciarSesion(respuesta);
        this.modal.mostrar('Partida cargada', `Hola ${respuesta.usuario.nombre}, el salón te estaba esperando.`);
        this.router.navigate(['/publicaciones']);
      },
      error: (error) => {
        this.cargando.set(false);
        this.modal.mostrarErrorHttp(error);
      },
    });
  }
}