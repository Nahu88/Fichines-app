import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../servicios/auth';
import { Modal } from '../../servicios/modal';
import {
  clavesCoincidenValidator,
  edadMinimaValidator,
  passwordFuerteValidator,
} from '../../validators/usuario.validators';
import { Emblema } from '../emblema/emblema';

@Component({
  imports: [ReactiveFormsModule, RouterLink, Emblema],
  selector: 'app-registro',
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  auth = inject(Auth);
  modal = inject(Modal);
  router = inject(Router);

  cargando = signal(false);

  // La imagen no va dentro del FormGroup: los input file se manejan aparte.
  imagen: File | null = null;
  nombreImagen = signal('');
  // Dirección temporal de la foto elegida, para mostrarla en el cuadro antes de subirla.
  vistaPrevia = signal('');

  // La contraseña va en una variable aparte (como controlClave en el repo de la cursada)
  // para poder pasársela al validador de "repetir contraseña".
  controlPassword = new FormControl('', { validators: [Validators.required, passwordFuerteValidator()] });

  formRegistro = new FormGroup({
      nombre: new FormControl('', { validators: [Validators.required, Validators.maxLength(40)] }),
      apellido: new FormControl('', { validators: [Validators.required, Validators.maxLength(40)] }),
      correo: new FormControl('', { validators: [Validators.required, Validators.email] }),
      usuario: new FormControl('', {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9_.]+$/)],
      }),
      password: this.controlPassword,
      repetirPassword: new FormControl('', {
        validators: [Validators.required, clavesCoincidenValidator(this.controlPassword)],
      }),
      fechaNacimiento: new FormControl('', { validators: [Validators.required, edadMinimaValidator(13)] }),
      descripcion: new FormControl('', { validators: [Validators.maxLength(160)] }),
  });

  // Atajo para usar en el HTML: muestra el error solo si el campo ya fue tocado.
  tieneError(campo: string, error: string) {
    const control = this.formRegistro.get(campo);
    return control!.touched && control!.hasError(error);
  }

  // Barra de "personaje listo": qué porcentaje de los campos obligatorios ya está bien completado.
  // filter se queda con los campos válidos y length los cuenta.
  progreso() {
    const campos = ['nombre', 'apellido', 'correo', 'usuario', 'password', 'repetirPassword', 'fechaNacimiento'];
    const completos = campos.filter((campo) => this.formRegistro.get(campo)!.valid).length;
    return Math.round((completos / campos.length) * 100);
  }

  elegirImagen(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      this.modal.mostrar('Ese archivo no sirve', 'Elegí una imagen (JPG, PNG o WEBP).', 'error');
      input.value = '';
      return;
    }
    if (archivo.size > 2 * 1024 * 1024) {
      this.modal.mostrar('Imagen muy pesada', 'La foto puede pesar hasta 2 MB.', 'error');
      input.value = '';
      return;
    }

    this.imagen = archivo;
    this.nombreImagen.set(archivo.name); // para mostrar qué archivo eligió
    // createObjectURL crea una dirección que apunta al archivo que está en la PC,
    // así el <img> puede mostrarlo sin tener que subirlo primero.
    this.vistaPrevia.set(URL.createObjectURL(archivo));
  }

  registrarse() {
    if (this.formRegistro.invalid) {
      this.formRegistro.markAllAsTouched();
      return;
    }

    // Armamos un FormData porque mandamos texto + archivo en la misma petición.
    // No mandamos repetirPassword: solo sirve para validar en el front.
    const valores = this.formRegistro.value;
    const datos = new FormData();
    datos.append('nombre', valores.nombre!);
    datos.append('apellido', valores.apellido!);
    datos.append('correo', valores.correo!);
    datos.append('usuario', valores.usuario!);
    datos.append('password', valores.password!);
    datos.append('fechaNacimiento', valores.fechaNacimiento!);
    datos.append('descripcion', valores.descripcion || '');
    if (this.imagen) {
      datos.append('imagen', this.imagen);
    }

    this.cargando.set(true);
    this.auth.registro(datos).subscribe({
      next: (usuario) => {
        this.cargando.set(false);
        this.auth.guardarSesion(usuario);
        this.modal.mostrar('Cuenta creada', `Bienvenido/a, ${usuario.nombre}. Ya tenés tu lugar en el salón.`);
        this.router.navigate(['/publicaciones']);
      },
      error: (error) => {
        this.cargando.set(false);
        this.modal.mostrarErrorHttp(error);
      },
    });
  }
}
