import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import hbs = require('hbs'); 

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
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
