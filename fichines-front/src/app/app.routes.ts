import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { invitadoGuard } from './guards/invitado-guard';
import { adminGuard } from './guards/admin-guard';

// Igual que en el repo de la cursada: cada pantalla se carga con loadComponent
// (carga diferida: el código de la pantalla se descarga recién cuando entrás).
// Los guards deciden quién puede entrar a cada pantalla:
//   invitadoGuard -> solo sin sesión (login, registro)
//   authGuard     -> solo con sesión (salón, publicación, mi perfil)
//   adminGuard    -> solo administradores (panel)
export const routes: Routes = [
  // SPRINT 3: la app arranca en la pantalla "Cargando", que valida el token con el back.
  { path: '', redirectTo: 'cargando', pathMatch: 'full' },
  {
    path: 'cargando',
    loadComponent: () => import('./componentes/cargando/cargando').then((m) => m.Cargando),
  },
  {
    path: 'login',
    loadComponent: () => import('./componentes/login/login').then((m) => m.Login),
    canActivate: [invitadoGuard],
  },
  {
    path: 'registro',
    loadComponent: () => import('./componentes/registro/registro').then((m) => m.Registro),
    canActivate: [invitadoGuard],
  },
  {
    path: 'publicaciones',
    loadComponent: () => import('./componentes/publicaciones/publicaciones').then((m) => m.Publicaciones),
    canActivate: [authGuard],
  },
  {
    // SPRINT 3: una publicación en grande con sus comentarios. ":id" es el _id de la publicación.
    path: 'publicaciones/:id',
    loadComponent: () =>
      import('./componentes/publicacion-detalle/publicacion-detalle').then((m) => m.PublicacionDetalle),
    canActivate: [authGuard],
  },
  {
    path: 'mi-perfil',
    loadComponent: () => import('./componentes/mi-perfil/mi-perfil').then((m) => m.MiPerfil),
    canActivate: [authGuard],
  },
  {
    path: 'panel',
    loadComponent: () => import('./componentes/panel/panel').then((m) => m.Panel),
    // Primero chequea que haya sesión, después que sea administrador
    canActivate: [authGuard, adminGuard],
  },
  // Cualquier otra dirección vuelve al inicio (Cargando decide a dónde ir)
  { path: '**', redirectTo: 'cargando' },
];
