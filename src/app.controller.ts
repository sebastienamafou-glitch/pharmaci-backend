import { Controller, Get, Render, Query } from '@nestjs/common'; // ✅ Ajout de Query
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 1. PAGE D'ACCUEIL (Landing Page)
  @Get()
  @Render('landing') // views/landing.hbs
  root() {
    return { 
      title: 'PharmaCi - La Santé pour Tous',
      year: new Date().getFullYear()
    };
  }

  // 2. PAGE MINISTÈRE (Admin)
  // C'est le lien discret que nous avons mis dans le footer
  @Get('admin')
  @Render('admin') // views/admin.hbs
  admin() {
    return { title: 'Administration Ministère' };
  }

  // 3. ESPACE PHARMACIEN
  @Get('dashboard')
  @Render('index') // views/index.hbs
  dashboard() {
    return { title: 'Espace Pharmacien' };
  }

  // 4. ESPACE LIVREUR
  @Get('livreur-dashboard')
  @Render('livreur') // views/livreur.hbs
  livreur(@Query('livreurId') livreurId: string) {
    return { 
      title: 'Espace Livreur',
      livreurId: livreurId || 'Inconnu'
    };
  }
}
