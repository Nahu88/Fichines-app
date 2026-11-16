import { NestFactory } from '@nestjs/core';
import * as dns from 'dns';
import { AppModule } from './app.module.js';
import { configurarApp } from './configurar-app.js';
 
// Evita problemas de DNS al conectar con MongoDB Atlas.
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Arranque en la PC. En Vercel se usa serverless.ts.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configurarApp(app);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
 