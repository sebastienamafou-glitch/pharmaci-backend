import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import hbs = require('hbs'); 

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Force Update Vercel

  // ✅ CRUCIAL POUR LA PWA : On ouvre les vannes (CORS)
  // Cela permet à votre site Web (et à l'app mobile) de discuter avec le serveur
  app.enableCors({
    origin: '*', // Pour la démo, on autorise tout le monde.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  hbs.registerHelper('eq', (a, b) => a === b);

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
