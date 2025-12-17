import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import hbs = require('hbs'); 
import { ValidationPipe } from '@nestjs/common'; // ✅ 1. IMPORT NECESSAIRE

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // ✅ 2. ACTIVATION DE LA SÉCURITÉ (VALIDATION DES ENTRÉES)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // 🛡️ Sécurité : Supprime automatiquement tout champ non déclaré dans le DTO
    forbidNonWhitelisted: true, // 🛡️ Sécurité : Renvoie une erreur si un champ inconnu est détecté
    transform: true, // 🛠️ Pratique : Convertit les types (ex: "id": "123" devient le nombre 123)
  }));

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ✅ Cette ligne est cruciale pour que /js/dashboard.js fonctionne
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // Helper HBS conservé
  hbs.registerHelper('eq', (a, b) => a === b);

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
