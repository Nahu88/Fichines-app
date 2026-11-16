import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../servicios/auth';

// Sin token: al login. Con token sin validar (por ejemplo, al recargar): a "Cargando".
export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.token()) {
    router.navigate(['/login']);
    return false;
  }
  if (!auth.sesionValidada()) {
    router.navigate(['/cargando']);
    return false;
  }
  return true;
};
