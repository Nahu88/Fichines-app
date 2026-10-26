import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../servicios/auth';

// Lo contrario de authGuard: login y registro son solo para quien NO inició sesión.
// Si ya estás logueado y entrás a /login, te manda directo al salón.
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.usuarioActual()) {
    return true;
  }
  router.navigate(['/publicaciones']);
  return false;
};