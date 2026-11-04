import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { RespuestaAuth, Usuario } from '../models/usuario';
import { Modal } from './modal';

// Servicio que habla con el módulo de autenticación del back,
// recuerda quién inició sesión y maneja el token JWT.
@Service()
export class Auth {
  http = inject(HttpClient);
  modal = inject(Modal);

  url = `${environment.apiUrl}/auth`;

  // Signal con el usuario logueado (null si no hay nadie).
  // Arranca leyendo el localStorage para no perder la sesión al recargar.
  usuarioActual = signal<Usuario | null>(this.leerUsuarioGuardado());


  token = signal<string | null>(localStorage.getItem('token'));
  sesionValidada = signal(false);

  private temporizador: any = null;

  // ---------- Pedidos al back ----------

  // El registro va como FormData porque incluye un archivo (la imagen).
  registro(datos: FormData) {
    return this.http.post<RespuestaAuth>(`${this.url}/registro`, datos);
  }

  login(identificador: string, password: string) {
    return this.http.post<RespuestaAuth>(`${this.url}/login`, { identificador, password });
  }

  // POST /auth/autorizar: el back valida el token y devuelve los datos del usuario.
  // El token lo agrega solo el interceptor (ver interceptors/auth-interceptor.ts).
  autorizar() {
    return this.http.post<Usuario>(`${this.url}/autorizar`, {});
  }

  // POST /auth/refrescar: devuelve un token nuevo con otros 15 minutos.
  refrescar() {
    return this.http.post<{ token: string }>(`${this.url}/refrescar`, {});
  }

  // ---------- Sesión ----------

  // Se llama después del login o el registro.
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
    clearTimeout(this.temporizador); // si había un aviso programado, lo cancelamos
    this.usuarioActual.set(null);
    this.token.set(null);
    this.sesionValidada.set(false);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  }

  // ---------- Aviso de vencimiento ----------

  // El aviso sale cuando pasaron 2/3 de la vida del token:
  // - token de 15 minutos -> avisa a los 10 minutos (quedan 5), como pide el TP.
  // - token de 30 segundos (para probarlo en clase) -> avisa a los 20 (quedan 10).
  // Así la duración se cambia en un solo lugar: el back (auth.module.ts).
  // Si el token vence sin extenderlo, el próximo pedido al back da 401 y el interceptor
  // (interceptors/auth-interceptor.ts) cierra la sesión y lleva al login.
  iniciarContador() {
    clearTimeout(this.temporizador);
    const payload = this.leerPayload();
    if (!payload) return;

    // iat = cuándo se creó el token, exp = cuándo vence (los dos en segundos).
    const duracion = (payload.exp - payload.iat) * 1000;       // lo que dura, en milisegundos
    const momentoAviso = payload.iat * 1000 + (duracion * 2) / 3;
    const avisarEn = momentoAviso - Date.now();                // cuánto falta para avisar

    // setTimeout ejecuta la función una vez, pasado ese tiempo.
    // Math.max(..., 0): si ya pasó el momento del aviso (por ejemplo, recargaste la página), avisa enseguida.
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
        this.iniciarContador(); // con el token nuevo, el contador arranca de nuevo
        this.modal.mostrar('Sesión extendida', `Tenés ${this.tiempoRestante()} más para seguir jugando.`);
      },
      error: (error) => this.modal.mostrarErrorHttp(error),
    });
  }

  // Un JWT tiene 3 partes separadas por puntos: cabecera.payload.firma
  // El payload (la del medio) está en base64 y se puede leer: adentro están "iat" y "exp".
  // atob lo decodifica y JSON.parse lo vuelve objeto.
  // (los replace adaptan el formato del token al que entiende atob)
  private leerPayload() {
    const token = this.token();
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  }

  // Texto con lo que le queda al token: "5 minutos" o "7 segundos".
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
