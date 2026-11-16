import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { RespuestaAuth, Usuario } from '../models/usuario';
import { Modal } from './modal';

// Login, registro y manejo de la sesión (usuario y token en el localStorage).
@Service()
export class Auth {
  http = inject(HttpClient);
  modal = inject(Modal);

  url = `${environment.apiUrl}/auth`;

  usuarioActual = signal<Usuario | null>(this.leerUsuarioGuardado());


  token = signal<string | null>(localStorage.getItem('token'));
  sesionValidada = signal(false);

  private temporizador: any = null;

  registro(datos: FormData) {
    return this.http.post<RespuestaAuth>(`${this.url}/registro`, datos);
  }

  login(identificador: string, password: string) {
    return this.http.post<RespuestaAuth>(`${this.url}/login`, { identificador, password });
  }

  autorizar() {
    return this.http.post<Usuario>(`${this.url}/autorizar`, {});
  }

  refrescar() {
    return this.http.post<{ token: string }>(`${this.url}/refrescar`, {});
  }

  // Después del login o el registro.
  iniciarSesion(respuesta: RespuestaAuth) {
    this.guardarUsuario(respuesta.usuario);
    this.guardarToken(respuesta.token);
    this.sesionValidada.set(true);
    this.iniciarContador();
  }

  guardarUsuario(usuario: Usuario) {
    this.usuarioActual.set(usuario);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  guardarToken(token: string) {
    this.token.set(token);
    localStorage.setItem('token', token);
  }

  cerrarSesion() {
    clearTimeout(this.temporizador);
    this.usuarioActual.set(null);
    this.token.set(null);
    this.sesionValidada.set(false);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  }

  // Avisa cuando pasaron 2/3 de la vida del token (15 min -> a los 10; 30 s -> a los 20).
  // Si vence sin extenderlo, el próximo pedido da 401 y el interceptor lleva al login.
  iniciarContador() {
    clearTimeout(this.temporizador);
    const payload = this.leerPayload();
    if (!payload) return;

    const duracion = (payload.exp - payload.iat) * 1000;
    const momentoAviso = payload.iat * 1000 + (duracion * 2) / 3;
    const avisarEn = momentoAviso - Date.now();

    this.temporizador = setTimeout(() => this.avisarVencimiento(), Math.max(avisarEn, 0));
  }

  private avisarVencimiento() {
    this.modal.confirmar(
      'Tu sesión está por vencer',
      `Quedan ${this.tiempoRestante()} de sesión. ¿Querés extenderla?`,
      () => this.extenderSesion(),
      'EXTENDER',
    );
  }

  private extenderSesion() {
    this.refrescar().subscribe({
      next: (respuesta) => {
        this.guardarToken(respuesta.token);
        this.iniciarContador();
        this.modal.mostrar('Sesión extendida', `Tenés ${this.tiempoRestante()} más para seguir jugando.`);
      },
      error: (error) => this.modal.mostrarErrorHttp(error),
    });
  }

  // Lee el payload del JWT (la parte del medio, en base64), donde están iat y exp.
  private leerPayload() {
    const token = this.token();
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  }

  // "5 minutos" o "7 segundos".
  private tiempoRestante() {
    const payload = this.leerPayload();
    const segundos = payload ? Math.max(Math.round(payload.exp - Date.now() / 1000), 0) : 0;
    return segundos >= 60 ? `${Math.round(segundos / 60)} minutos` : `${segundos} segundos`;
  }

  private leerUsuarioGuardado(): Usuario | null {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  }
}
