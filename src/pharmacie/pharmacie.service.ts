import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pharmacie } from './pharmacie.entity';

@Injectable()
export class PharmacieService {
  constructor(
    @InjectRepository(Pharmacie)
    private repo: Repository<Pharmacie>,
  ) {}

  // =================================================================
  // 1. CRÉATION D'UNE PHARMACIE (ADMIN / SEED)
  // =================================================================
  async creer(nom: string, lat: number, lon: number, tel: string = '') {
    const pharma = this.repo.create({
      nom,
      telephone: tel,
      // PostGIS attend l'ordre [Longitude, Latitude] pour un Point
      position: { type: 'Point', coordinates: [lon, lat] },
      estDeGarde: false,
    });
    return await this.repo.save(pharma);
  }

  // =================================================================
  // 2. RECHERCHE GÉOGRAPHIQUE (RAYON EN MÈTRES)
  // =================================================================
  async trouverProches(lat: number, lon: number, rayonMetres: number = 10000) {
    return this.repo
      .createQueryBuilder('pharmacie')
      .where(
        // 💡 ASTUCE PRO : On cast (::geography) à la volée pour calculer en mètres
        `ST_DWithin(
          pharmacie.position::geography, 
          ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, 
          :rayon
        )`,
        { lon, lat, rayon: rayonMetres } 
      )
      .orderBy(
        // On trie du plus proche au plus loin
        `ST_Distance(
          pharmacie.position::geography, 
          ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography
        )`, 
        'ASC'
      )
      .getMany();
  }

  // =================================================================
  // 3. LISTER TOUT (SIMPLE)
  // =================================================================
  async listerToutes() {
    return this.repo.find();
  }
}
