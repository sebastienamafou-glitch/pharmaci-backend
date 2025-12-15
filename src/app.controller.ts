import { Controller, Get, Redirect } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pharmacie } from './pharmacie/pharmacie.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectRepository(Pharmacie)
    private pharmacieRepo: Repository<Pharmacie>,
  ) {}

  // ✅ Redirection Automatique : La racine (/) renvoie vers le login Pro
  @Get()
  @Redirect('/auth/web/login', 302)
  root() {
    // Cette méthode ne fait rien d'autre que rediriger
    return;
  }

  // (Optionnel) Votre ancienne route de test, gardée au cas où
  @Get('creer-test')
  async creerPharmacieTest() {
    const nouvellePharmacie = this.pharmacieRepo.create({
      nom: 'Grande Pharmacie du Plateau',
      adresse: 'Avenue Chardy, Abidjan',
      estDeGarde: true,
      position: {
        type: 'Point',
        coordinates: [-4.0197, 5.3261], 
      },
    });
    return await this.pharmacieRepo.save(nouvellePharmacie);
  }
}
