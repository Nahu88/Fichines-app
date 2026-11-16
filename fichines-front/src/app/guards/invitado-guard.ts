import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../servicios/auth';

// Login y registro solo sin sesión; si ya hay token, va al salón.
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.token()) {
    return true;
  }
  router.navigate(['/publicaciones']);
  return false;
};
