import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../servicios/auth';

// Igual que en el ejemplo "guards" de la cursada.
// Deja pasar solo si hay alguien logueado; si no, lo manda al login.
// SPRINT 1: mira el usuario guardado en el navegador (mock).
// SPRINT 3: acá se va a validar el token contra el back.
export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.usuarioActual()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};