import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { configurarApp } from './configurar-app.js';
 
// Así arranca el back EN VERCEL.
// Vercel no deja un servidor prendido escuchando un puerto (no hay app.listen):
// por cada petición llama a esta función con (req, res).
// La app de Nest se crea la primera vez y se reutiliza en las siguientes
// peticiones, para no reconectar a Mongo cada vez.
let app: INestApplication | null = null;
 
export default async function handler(req: any, res: any) {
  if (!app) {
    app = await NestFactory.create(AppModule);
    configurarApp(app);
    await app.init(); // prepara las rutas sin escuchar un puerto
  }
  // Le pasamos la petición a Express (el servidor que usa Nest por dentro).
  const express = app.getHttpAdapter().getInstance();
  return express(req, res);
}
 