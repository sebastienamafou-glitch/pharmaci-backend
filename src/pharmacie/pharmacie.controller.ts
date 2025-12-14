import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PharmacieService } from './pharmacie.service';

@Controller('pharmacies') // Toutes les URLs commenceront par /pharmacies
export class PharmacieController {
  constructor(private readonly service: PharmacieService) {}

  // URL: POST /pharmacies
  // Pour créer des pharmacies facilement
  @Post()
  async ajouter(@Body() body: any) {
    return this.service.creer(body.nom, body.adresse, body.lat, body.lon);
  }

  // URL: GET /pharmacies/proche?lat=5.3&lon=-4.0
  // C'est ça que l'appli mobile va appeler
  @Get('proche')
  async trouverProche(
    @Query('lat') lat: number, 
    @Query('lon') lon: number
  ) {
    return this.service.trouverAutour(lat, lon);
  }
}
