import { Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from '../../servicios/modal';
import { UsuariosService } from '../../servicios/usuarios';
import { Usuario } from '../../models/usuario';
import {
  clavesCoincidenValidator,
  edadMinimaValidator,
  passwordFuerteValidator,
} from '../../validators/usuario.validators';

// Alta de un jugador (administrador): los campos del registro más el perfil.
// Avisa al padre con el output "creado".
@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.html',
  styleUrl: './nuevo-usuario.css',
})
export class NuevoUsuario {
  modal = inject(Modal);
  servicio = inject(UsuariosService);

  creado = output<Usuario>();
  cancelado = output<void>();

  enviando = signal(false);
  imagen: File | null = null;
  nombreImagen = signal('');

  controlPassword = new FormControl('', { validators: [Validators.required, passwordFuerteValidator()] });

  formUsuario = new FormGroup({
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
    perfil: new FormControl('usuario', { validators: [Validators.required] }),
  });

  tieneError(campo: string, error: string) {
    const control = this.formUsuario.get(campo);
    return control!.touched && control!.hasError(error);
  }

  elegirImagen(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/') || archivo.size > 2 * 1024 * 1024) {
      this.modal.mostrar('Esa imagen no sirve', 'Elegí una imagen de hasta 2 MB.', 'error');
      input.value = '';
      return;
    }
    this.imagen = archivo;
    this.nombreImagen.set(archivo.name);
  }

  crear() {
    if (this.formUsuario.invalid) {
      this.formUsuario.markAllAsTouched();
      return;
    }

    const valores = this.formUsuario.value;
    const datos = new FormData();
    datos.append('nombre', valores.nombre!);
    datos.append('apellido', valores.apellido!);
    datos.append('correo', valores.correo!);
    datos.append('usuario', valores.usuario!);
    datos.append('password', valores.password!);
    datos.append('fechaNacimiento', valores.fechaNacimiento!);
    datos.append('descripcion', valores.descripcion || '');
    datos.append('perfil', valores.perfil!);
    if (this.imagen) {
      datos.append('imagen', this.imagen);
    }

    this.enviando.set(true);
    this.servicio.crear(datos).subscribe({
      next: (nuevo) => {
        this.enviando.set(false);
        this.creado.emit(nuevo); // avisa al padre
      },
      error: (error) => {
        this.enviando.set(false);
        this.modal.mostrarErrorHttp(error);
      },
    });
  }
}
