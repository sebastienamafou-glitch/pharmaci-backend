import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PharmacieService } from './pharmacie.service';

@Controller('pharmacies')
export class PharmacieController {
  constructor(private readonly service: PharmacieService) {}

  // API: GET /pharmacies/proche?lat=5.3&lon=-4.0
  @Get('proche')
  async trouverProches(
    @Query('lat') lat: string, 
    @Query('lon') lon: string,
    @Query('rayon') rayon: string, // ✅ NOUVEAU PARAMÈTRE
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    // Rayon par défaut de 10km (0.1 degré approx pour simplifier ou conversion metres)
    // Ici on laisse PostGIS gérer.
    return this.service.trouverProches(latitude, longitude);
  }

  // API: GET /pharmacies (Liste simple)
  @Get()
  async toutVoir() {
    return this.service.listerToutes();
  }

  // API: POST /pharmacies (Pour créer des données de test)
  @Post()
  async creer(@Body() body: any) {
    return this.service.creer(body.nom, body.lat, body.lon, body.telephone);
  }
}
