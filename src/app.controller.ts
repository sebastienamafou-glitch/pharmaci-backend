import { Controller, Get, Render, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // ==========================================================
  // 1. POLITIQUE DE CONFIDENTIALITÉ (Lien pour les Stores)
  // ==========================================================
  @Get('politique')
  @Render('politique') // Rend le fichier views/politique.hbs
  getPolitique() {
    return { title: 'Politique de Confidentialité - PharmaCi' };
  }

  // ==========================================================
  // 2. PAGE D'ACCUEIL (Landing Page)
  // ==========================================================
  @Get()
  @Render('landing') // views/landing.hbs
  root() {
    return { 
      title: 'PharmaCi - La Santé pour Tous',
      year: new Date().getFullYear()
    };
  }

  // ==========================================================
  // 3. PAGE MINISTÈRE (Admin)
  // ==========================================================
  @Get('admin')
  @Render('admin') // views/admin.hbs
  admin() {
    return { title: 'Administration Ministère' };
  }

  // ==========================================================
  // 4. ESPACE PHARMACIEN (Dashboard)
  // ==========================================================
  @Get('dashboard')
  @Render('index') // views/index.hbs
  dashboard() {
    return { title: 'Espace Pharmacien' };
  }

  // ==========================================================
  // 5. ESPACE LIVREUR
  // ==========================================================
  @Get('livreur-dashboard')
  @Render('livreur') // views/livreur.hbs
  livreur(@Query('livreurId') livreurId: string) {
    return { 
      title: 'Espace Livreur',
      livreurId: livreurId || 'Inconnu'
    };
  }
}
