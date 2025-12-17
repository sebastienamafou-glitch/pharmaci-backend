import { Controller, Get, Post, Body } from '@nestjs/common';
import { PubliciteService } from './publicite.service'; // ✅ Import du Service

@Controller('publicites')
export class PubliciteController {
  constructor(private readonly service: PubliciteService) {} // ✅ Injection du Service

  // Récupérer les pubs actives
  @Get()
  async getPublicites() {
    return this.service.trouverPubsActives();
  }

  // Créer une pub
  @Post()
  async create(@Body() body: any) {
    return this.service.creer(body);
  }
}
