import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hub } from './hubs.entity';

@Injectable()
export class HubsService {
  constructor(
    @InjectRepository(Hub)
    private hubRepo: Repository<Hub>,
  ) {}

  // Créer un hub (Admin)
  async create(nom: string, lat: number, lon: number, rayon: number) {
    const hub = this.hubRepo.create({ nom, lat, lon, rayonKm: rayon });
    return this.hubRepo.save(hub);
  }

  async findAll() {
    return this.hubRepo.find({ where: { isActive: true } });
  }

  // 🧠 L'ALGORITHME DE DISPATCH
  // Trouve le hub le plus proche d'une position donnée
  async trouverHubProche(lat: number, lon: number): Promise<Hub | null> {
    const hubs = await this.findAll();
    let plusProche: Hub | null = null;
    let distanceMin = Infinity;

    for (const hub of hubs) {
      const dist = this.calculerDistance(lat, lon, hub.lat, hub.lon);
      // Si on est dans le rayon du hub et qu'il est le plus proche trouvé
      if (dist <= hub.rayonKm && dist < distanceMin) {
        distanceMin = dist;
        plusProche = hub;
      }
    }
    return plusProche;
  }

  // Formule de Haversine (Calcul distance GPS en Km)
  private calculerDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
