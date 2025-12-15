import { Controller, Get, Post, Query, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { MedicamentService } from './medicament.service';

@Controller('medicaments')
export class MedicamentController {
  constructor(private readonly service: MedicamentService) {}

  // 1. Route d'initialisation SÉCURISÉE
  // Elle vérifie si le header "x-admin-secret" correspond à la variable d'env ADMIN_SECRET
  @Post('init')
  async initialiser(@Headers('x-admin-secret') secret: string) {
    // Récupère le mot de passe défini dans Render (ou 'admin123' par défaut en local)
    const adminSecret = process.env.ADMIN_SECRET || 'admin123';

    if (secret !== adminSecret) {
      throw new HttpException('Accès refusé : Clé secrète invalide', HttpStatus.FORBIDDEN);
    }

    return this.service.chargerDonneesInitiales();
  }

  // 2. Route de recherche publique
  @Get('recherche')
  async trouver(@Query('q') motCle: string) {
    if (!motCle) return [];
    return this.service.rechercher(motCle);
  }
}
