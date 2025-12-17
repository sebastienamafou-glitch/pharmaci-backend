import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'hbs'; 
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 1. SÉCURITÉ & VALIDATION
  // Permet de s'assurer que les données envoyées correspondent à tes DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 2. CONFIGURATION CORS
  // Essentiel pour que ton application mobile puisse communiquer avec l'API
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. VUES & FICHIERS STATIQUES (Dashboard Handlebars)
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // CONFIGURATION DES HELPERS HBS
  // Cette syntaxe est la plus robuste pour éviter l'erreur "registerHelper is not a function"
  hbs.registerHelper('eq', (a: any, b: any) => a === b);
  
  // Tu peux ajouter d'autres helpers ici si nécessaire, par exemple pour les dates :
  hbs.registerHelper('formatDate', (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  });

  // 4. PORT DYNAMIQUE (CRITIQUE POUR RENDER)
  // Render attribue un port aléatoire via la variable d'environnement PORT
  const port = process.env.PORT || 3000;
  
  // L'écoute sur '0.0.0.0' est nécessaire pour que Render puisse router le trafic
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Serveur lancé avec succès sur le port ${port}`);
}

bootstrap();
