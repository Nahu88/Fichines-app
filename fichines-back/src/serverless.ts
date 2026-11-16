import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { configurarApp } from './configurar-app.js';

// Arranque en Vercel: no hay app.listen; Vercel llama a esta función en cada pedido.
// La app se crea una sola vez y se reutiliza para no reconectar a Mongo.
let app: INestApplication | null = null;

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await NestFactory.create(AppModule);
    configurarApp(app);
    await app.init();
  }
  const express = app.getHttpAdapter().getInstance();
  return express(req, res);
}
