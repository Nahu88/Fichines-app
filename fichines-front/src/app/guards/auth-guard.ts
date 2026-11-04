import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../servicios/auth';

// Igual que en el ejemplo "guards" de la cursada.
// Deja pasar solo si hay alguien logueado; si no, lo manda al login.
// SPRINT 3:
// - Si no hay token -> al login.
// - Si hay token pero todavía no lo validamos con el back en esta visita
//   (por ejemplo, recargaste la página) -> a la pantalla "Cargando", que lo valida.
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
