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

  async creerDemande(medicament: string, lat: number, lon: number, paiement: string = 'ESPECES') {
    // ✅ Génération d'un code aléatoire entre 1000 et 9999
    const codeSecret = Math.floor(1000 + Math.random() * 9000).toString();

    const nouvelleDemande = this.repoDemande.create({
      medicamentNom: medicament,
      statut: 'EN_ATTENTE',
      modePaiement: paiement,
      codeRetrait: codeSecret, // ✅ On sauvegarde le code unique ici
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
