import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publicite } from './publicite.entity';

@Controller('publicites')
export class PubliciteController {
  constructor(
    @InjectRepository(Publicite)
    private pubRepo: Repository<Publicite>,
  ) {}

  // Récupérer les pubs actives pour l'app mobile (Public)
  @Get()
  async getPublicites() {
    return this.pubRepo.find({
      where: { isActive: true },
      order: { ordre: 'ASC' },
    });
  }

  // Créer une pub (Pour test ou Admin)
  @Post()
  async create(@Body() body: any) {
    return this.pubRepo.save(body);
  }
}
