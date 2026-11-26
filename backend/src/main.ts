import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { CARPETA_LOCAL } from './common/almacenamiento';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Fotos guardadas en el disco (solo si no hay CLOUDINARY_URL; ver common/almacenamiento.ts)
  mkdirSync(CARPETA_LOCAL, { recursive: true });
  app.useStaticAssets(CARPETA_LOCAL, { prefix: '/uploads' });
  // Fotos de los negocios de ejemplo (vienen en el repositorio)
  app.useStaticAssets(join(process.cwd(), 'ejemplos'), { prefix: '/ejemplos', maxAge: '7d' });
  // FRONTEND_URL acepta varias direcciones separadas por coma (ej. la de Vercel y localhost)
  app.enableCors({ origin: (process.env.FRONTEND_URL ?? 'http://localhost:3000').split(',').map((u) => u.trim()) });
  // Valida los DTO automáticamente y descarta campos que no esperamos
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // 0.0.0.0 para que Render y otros servicios en la nube puedan llegar al puerto
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
