import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publicite } from './publicite.entity';

@Injectable()
export class PubliciteService {
  constructor(
    @InjectRepository(Publicite)
    private pubRepo: Repository<Publicite>,
  ) {}

  // Récupérer uniquement les pubs actives
  async trouverPubsActives() {
    return this.pubRepo.find({
      where: { isActive: true },
      order: { ordre: 'ASC' },
    });
  }

  // Créer une pub (pour vos tests ou un futur admin)
  async creer(data: any) {
    const nouvellePub = this.pubRepo.create(data);
    return this.pubRepo.save(nouvellePub);
  }
}
