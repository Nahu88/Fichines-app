import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../servicios/auth';

export const authInterceptor: HttpInterceptorFn = (pedido, siguiente) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const token = auth.token();

  // Agrega el token a cada pedido.
  const pedidoConToken = token
    ? pedido.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : pedido;

  return siguiente(pedidoConToken).pipe(
    catchError((error) => {
      // 401 con token: venció o no es válido, así que se cierra la sesión.
      if (error.status === 401 && token) {
        auth.cerrarSesion();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
