import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../servicios/auth';
import { Modal } from '../servicios/modal';

// Solo deja pasar a usuarios con perfil "administrador".
// Un usuario común que escribe /panel a mano vuelve al salón con un aviso.
export const adminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const modal = inject(Modal);

  if (auth.usuarioActual()?.perfil === 'administrador') {
    return true;
  }
  modal.mostrar('Solo para el encargado', 'El mostrador es solo para administradores. Tu cuenta no tiene permiso para entrar.', 'error');
  router.navigate(['/publicaciones']);
  return false;
};