import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pharmacie } from './pharmacie/pharmacie.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // On injecte l'outil pour parler à la table Pharmacie
    @InjectRepository(Pharmacie)
    private pharmacieRepo: Repository<Pharmacie>,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Voici notre URL de test
  @Get('creer-test')
  async creerPharmacieTest() {
    // On crée une fausse pharmacie au Plateau
    const nouvellePharmacie = this.pharmacieRepo.create({
      nom: 'Grande Pharmacie du Plateau',
      adresse: 'Avenue Chardy, Abidjan',
      estDeGarde: true,
      position: {
        type: 'Point',
        coordinates: [-4.0197, 5.3261], // Longitude, Latitude (Abidjan)
      },
    });

    // On sauvegarde dans la base
    return await this.pharmacieRepo.save(nouvellePharmacie);
  }
}
