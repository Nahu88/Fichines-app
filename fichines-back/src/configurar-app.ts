import { INestApplication, ValidationPipe } from '@nestjs/common';

// Configuración que comparten las dos formas de arrancar el back:
// main.ts (en tu PC) y serverless.ts (en Vercel). Así no se repite.
export function configurarApp(app: INestApplication) {
  // Permite que el front (otro dominio/puerto) le haga peticiones al back.
  app.enableCors();

  // Valida todos los DTO automáticamente.
  // whitelist: true -> descarta campos que no estén en el DTO (ej: alguien que mande perfil: "administrador").
  // stopAtFirstError: true -> un solo mensaje por campo (el primero que falla).
  // transform: true -> convierte los datos al tipo del DTO. Lo usamos en el listado de
  // publicaciones: lo que llega por la URL (?offset=5) es texto, y así se vuelve número.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, stopAtFirstError: true, transform: true }));
}
