import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Demande } from './demande.entity';

@Injectable()
export class DemandeService {
  constructor(
    @InjectRepository(Demande)
    private repoDemande: Repository<Demande>, 
  ) {}

  // ✅ MISE A JOUR : Ajout du paramètre paiement
  async creerDemande(medicament: string, lat: number, lon: number, paiement: string = 'ESPECES') {
    const nouvelleDemande = this.repoDemande.create({
      medicamentNom: medicament,
      statut: 'EN_ATTENTE',
      modePaiement: paiement, // On enregistre le choix
      positionClient: {
        type: 'Point',
        coordinates: [lon, lat],
      },
    });
    return await this.repoDemande.save(nouvelleDemande);
  }

  async listerToutes() {
    return this.repoDemande.find({ order: { dateCreation: 'DESC' } });
  }

  async trouverParId(id: string): Promise<Demande | null> {
    return await this.repoDemande.findOne({ where: { id: id } });
  }
  
  async accepterDemande(idDemande: string) {
    const demande = await this.repoDemande.findOne({ where: { id: idDemande } });
    
    if (demande) {
      demande.statut = 'TROUVE';
      demande.pharmacieId = "pharmacie-demo-1";
      demande.pharmacieNom = "Pharmacie du Plateau";
      demande.positionPharmacie = { lat: 5.3260, lon: -4.0200 }; 
      return await this.repoDemande.save(demande);
    }
    return null;
  }
}
