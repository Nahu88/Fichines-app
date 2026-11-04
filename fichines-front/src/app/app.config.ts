import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Habilita HttpClient para hablar con el back.
    // SPRINT 3: withInterceptors hace que todos los pedidos pasen por authInterceptor.
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
