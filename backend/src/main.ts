import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Fotos que suben los proveedores (carpeta uploads/, fuera de git)
  mkdirSync(join(process.cwd(), 'uploads'), { recursive: true });
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' });
  // Valida los DTO automáticamente y descarta campos que no esperamos
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
