import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../servicios/auth';
import { Modal } from '../../servicios/modal';
import { UsuariosService } from '../../servicios/usuarios';
import { Usuario } from '../../models/usuario';
import { NombreCompletoPipe } from '../../pipes/nombre-completo-pipe';
import { FiltroUsuariosPipe } from '../../pipes/filtro-usuarios-pipe';
import { BrilloHoverDirective } from '../../directivas/brillo-hover.directive';
import { ImagenRespaldoDirective } from '../../directivas/imagen-respaldo.directive';
import { NuevoUsuario } from '../nuevo-usuario/nuevo-usuario';

// Pestaña "Jugadores": listado con buscador, alta de usuarios y habilitar/deshabilitar.
@Component({
  imports: [FormsModule, NombreCompletoPipe, FiltroUsuariosPipe, BrilloHoverDirective, ImagenRespaldoDirective, NuevoUsuario],
  selector: 'app-admin-usuarios',
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.css',
})
export class AdminUsuarios implements OnInit {
  auth = inject(Auth);
  modal = inject(Modal);
  servicio = inject(UsuariosService);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  busqueda = signal('');
  mostrarFormulario = signal(false);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.servicio.listar().subscribe({
      next: (usuarios) => {
        this.cargando.set(false);
        this.usuarios.set(usuarios);
      },
      error: (error) => {
        this.cargando.set(false);
        this.modal.mostrarErrorHttp(error);
      },
    });
  }

  cantidadAdmins() {
    return this.usuarios().filter((u) => u.perfil === 'administrador').length;
  }

  cantidadDeshabilitados() {
    return this.usuarios().filter((u) => !u.activo).length;
  }

  // El admin no puede deshabilitarse a sí mismo.
  esYo(usuario: Usuario) {
    return usuario._id === this.auth.usuarioActual()?._id;
  }

  deshabilitar(usuario: Usuario) {
    this.modal.confirmar(
      'Deshabilitar jugador',
      `@${usuario.usuario} no va a poder iniciar sesión hasta que lo vuelvas a habilitar.`,
      () => {
        this.servicio.deshabilitar(usuario._id).subscribe({
          next: (actualizado) => this.reemplazar(actualizado),
          error: (error) => this.modal.mostrarErrorHttp(error),
        });
      },
      'DESHABILITAR',
    );
  }

  habilitar(usuario: Usuario) {
    this.servicio.habilitar(usuario._id).subscribe({
      next: (actualizado) => {
        this.reemplazar(actualizado);
        this.modal.mostrar('Jugador habilitado', `@${usuario.usuario} ya puede volver a entrar.`);
      },
      error: (error) => this.modal.mostrarErrorHttp(error),
    });
  }

  // Output de <app-nuevo-usuario>.
  alCrear(nuevo: Usuario) {
    this.usuarios.update((lista) => [nuevo, ...lista]);
    this.mostrarFormulario.set(false);
    this.modal.mostrar('Jugador creado', `La cuenta de @${nuevo.usuario} ya está lista.`);
  }

  private reemplazar(actualizado: Usuario) {
    this.usuarios.update((lista) => lista.map((u) => (u._id === actualizado._id ? actualizado : u)));
  }
}
