import { Controller, Get, Post, Query } from '@nestjs/common';
import { MedicamentService } from './medicament.service';

@Controller('medicaments') // Toutes les routes commenceront par /medicaments
export class MedicamentController {
  constructor(private readonly service: MedicamentService) {}

  // 1. Route pour initialiser les données (POST http://localhost:3000/medicaments/init)
  // On l'appellera une seule fois pour remplir Meilisearch
  @Post('init')
  async initialiser() {
    return this.service.chargerDonneesInitiales();
  }

  // 2. Route de recherche (GET http://localhost:3000/medicaments/recherche?q=dolipran)
  // C'est celle-ci que l'app Flutter utilisera
  @Get('recherche')
  async trouver(@Query('q') motCle: string) {
    if (!motCle) return []; // Si pas de recherche, on renvoie vide
    return this.service.rechercher(motCle);
  }
}
