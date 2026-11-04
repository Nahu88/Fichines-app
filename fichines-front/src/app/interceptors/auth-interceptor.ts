import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../servicios/auth';

// Un interceptor es una función por la que pasan TODOS los pedidos HTTP del front
// antes de salir, y todas las respuestas antes de llegar al subscribe.
// Tiene la misma forma que los guards (CanActivateFn): una función con inject adentro.
// Se registra una sola vez en app.config.ts con withInterceptors([authInterceptor]).
export const authInterceptor: HttpInterceptorFn = (pedido, siguiente) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const token = auth.token();

  // 1) A la IDA: si hay token, lo agregamos en la cabecera Authorization.
  // Los pedidos no se pueden modificar: clone hace una copia con la cabecera nueva.
  const pedidoConToken = token
    ? pedido.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : pedido;

  // 2) A la VUELTA: siguiente(...) manda el pedido y devuelve la respuesta (un Observable).
  // pipe + catchError nos deja mirar los errores antes que el componente.
  return siguiente(pedidoConToken).pipe(
    catchError((error) => {
      // 401 con token = el token venció o no es válido -> cerramos la sesión y vamos al login.
      // (Sin token es otro caso, por ejemplo un login con la contraseña mal: eso lo maneja el login.)
      if (error.status === 401 && token) {
        auth.cerrarSesion();
        router.navigate(['/login']);
      }
      // throwError reenvía el error para que el subscribe del componente
      // también lo reciba y muestre el mensaje en el modal.
      return throwError(() => error);
    }),
  );
};
