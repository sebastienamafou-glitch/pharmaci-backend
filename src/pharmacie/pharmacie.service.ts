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

  // 1. Ajouter une pharmacie (pour peupler la base)
  async creer(nom: string, adresse: string, lat: number, lon: number) {
    const pharma = this.repo.create({
      nom,
      adresse,
      estDeGarde: false,
      position: {
        type: 'Point',
        coordinates: [lon, lat], // Attention : PostGIS c'est [Longitude, Latitude]
      },
    });
    return this.repo.save(pharma);
  }

  // 2. LA fonctionnalité clé : Trouver autour de moi
  async trouverAutour(lat: number, lon: number, rayonMetres: number = 5000) {
    // Cette requête magique utilise la géométrie sphérique de la Terre
    return this.repo
      .createQueryBuilder('p')
      .where(
        `ST_DWithin(
          p.position, 
          ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), 
          :rayon
        )`
      )
      .setParameters({ lat, lon, rayon: rayonMetres })
      .getMany();
  }
}
