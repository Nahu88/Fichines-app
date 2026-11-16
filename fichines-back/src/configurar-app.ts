import { INestApplication, ValidationPipe } from '@nestjs/common';

// Configuración compartida por main.ts (PC) y serverless.ts (Vercel).
export function configurarApp(app: INestApplication) {
  app.enableCors();

  // whitelist descarta campos que no estén en el DTO; transform convierte los textos de la URL a número.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, stopAtFirstError: true, transform: true }));
}
