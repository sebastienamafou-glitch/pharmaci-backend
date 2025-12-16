import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Demande } from './demande.entity';
// ✅ Import du service Médicament
import { MedicamentService } from '../medicament/medicament.service'; 
import { Medicament } from '../medicament/medicament.entity'; 

@Injectable()
export class DemandeService {
  constructor(
    @InjectRepository(Demande)
    private repoDemande: Repository<Demande>, 
    // ✅ Injection avec forwardRef pour éviter les bugs
    @Inject(forwardRef(() => MedicamentService)) 
    private medicamentService: MedicamentService, 
  ) {}

  async creerDemande(medicament: string, lat: number, lon: number, paiement: string = 'ESPECES') {
    // 1. Recherche ID Médicament
    const resultatsRecherche = await this.medicamentService.rechercher(medicament);
    const medicamentTrouve: Partial<Medicament> = resultatsRecherche.hits?.[0] || {};
    
    const codeSecret = Math.floor(1000 + Math.random() * 9000).toString();

    const nouvelleDemande = this.repoDemande.create({
      medicamentId: medicamentTrouve.id?.toString() || '0', 
      medicamentNom: medicament,
      statut: 'EN_ATTENTE',
      modePaiement: paiement,
      codeRetrait: codeSecret, 
      positionClient: { type: 'Point', coordinates: [lon, lat] },
      positionLivreur: null, 
    });
    return await this.repoDemande.save(nouvelleDemande);
  }

  async listerToutes() {
    const demandesBrutes = await this.repoDemande.find({ order: { dateCreation: 'DESC' } });
    
    // Enrichissement des données
    const medicamentsEnBase = (await this.medicamentService.rechercher('')).hits;
    
    const demandesEnrichies = demandesBrutes.map(d => {
        const medicamentDetail = medicamentsEnBase.find(m => 
            m.id?.toString() === d.medicamentId || m.nomCommercial === d.medicamentNom
        );

        return {
            ...d,
            medicament: medicamentDetail || { nomCommercial: d.medicamentNom, dci: 'N/A', dosage: 'N/A', forme: 'N/A', prixReference: '?', surOrdonnance: false },
            client: { nomComplet: 'Client Mobile' }, 
            id_short: d.id.substring(0, 8),
        };
    });
    return demandesEnrichies;
  }

  async trouverParId(id: string): Promise<Demande | null> {
    return await this.repoDemande.findOne({ where: { id: id } });
  }

  async accepterDemande(idDemande: string) {
    const demande = await this.repoDemande.findOne({ where: { id: idDemande } });
    if (demande) {
      demande.statut = 'ACCEPTEE'; 
      demande.pharmacieId = "pharmacie-demo-1";
      demande.pharmacieNom = "Pharmacie du Plateau";
      demande.positionPharmacie = { lat: 5.3260, lon: -4.0200 }; 
      return await this.repoDemande.save(demande);
    }
    return null;
  }

  // ✅ FONCTIONS LIVREUR
  async assignerLivreurADemande(idDemande: string, livreurId: string) {
    const demande = await this.repoDemande.findOne({ where: { id: idDemande } });
    if (demande && demande.statut === 'ACCEPTEE') {
      demande.statut = 'LIVRAISON_EN_COURS'; 
      demande.positionLivreur = demande.positionPharmacie; // Départ
      demande['livreurId'] = livreurId; 
      return await this.repoDemande.save(demande);
    }
    return null;
  }

  async updateLivreurPosition(idDemande: string, lat: number, lon: number) {
    const demande = await this.repoDemande.findOne({ where: { id: idDemande } });
    if (demande && demande.statut === 'LIVRAISON_EN_COURS') {
      demande.positionLivreur = { lat, lon };
      return await this.repoDemande.save(demande);
    }
    return null;
  }
}
