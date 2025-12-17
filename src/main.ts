import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

// ✅ Utilisation de require pour garantir que registerHelper est accessible en prod
const hbs = require('hbs');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 1. SÉCURITÉ & VALIDATION
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 2. CONFIGURATION CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. VUES & FICHIERS STATIQUES
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // ✅ ENREGISTREMENT DU HELPER AVEC VÉRIFICATION
  if (hbs && typeof hbs.registerHelper === 'function') {
    hbs.registerHelper('eq', (a: any, b: any) => a === b);
  } else {
    console.error("❌ Erreur: Impossible de charger hbs.registerHelper");
  }

  // 4. PORT DYNAMIQUE (CRITIQUE POUR RENDER)
  const port = process.env.PORT || 3000;
  
  // L'écoute sur '0.0.0.0' est indispensable pour Render [cite: 10]
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Serveur lancé sur le port ${port}`);
}

bootstrap();
