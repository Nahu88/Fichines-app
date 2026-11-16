import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { invitadoGuard } from './guards/invitado-guard';
import { adminGuard } from './guards/admin-guard';

// invitadoGuard: solo sin sesión. authGuard: solo con sesión. adminGuard: solo administradores.
export const routes: Routes = [
  // La app arranca en "Cargando", que valida el token.
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
    // Pestañas del Mostrador (se dibujan en el <router-outlet> de panel.html).
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      {
        path: 'usuarios',
        loadComponent: () => import('./componentes/admin-usuarios/admin-usuarios').then((m) => m.AdminUsuarios),
      },
      {
        path: 'estadisticas',
        loadComponent: () =>
          import('./componentes/admin-estadisticas/admin-estadisticas').then((m) => m.AdminEstadisticas),
      },
    ],
    canActivate: [authGuard, adminGuard],
  },
  { path: '**', redirectTo: 'cargando' },
];
