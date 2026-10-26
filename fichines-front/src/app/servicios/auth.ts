import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';

// Servicio que habla con el módulo de autenticación del back
// y recuerda quién inició sesión.
@Service()
export class Auth {
  http = inject(HttpClient);

  // Signal con el usuario logueado (null si no hay nadie).
  // Arranca leyendo el localStorage para no perder la sesión al recargar.
  usuarioActual = signal<Usuario | null>(this.leerUsuarioGuardado());

  // El registro va como FormData porque incluye un archivo (la imagen).
  registro(datos: FormData) {
    return this.http.post<Usuario>(`${environment.apiUrl}/auth/registro`, datos);
  }

  login(identificador: string, password: string) {
    return this.http.post<Usuario>(`${environment.apiUrl}/auth/login`, { identificador, password });
  }

  guardarSesion(usuario: Usuario) {
    this.usuarioActual.set(usuario);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  cerrarSesion() {
    this.usuarioActual.set(null);
    localStorage.removeItem('usuario');
  }

  private leerUsuarioGuardado(): Usuario | null {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  }
}