import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Demande } from './demande.entity';
import { MedicamentService } from '../medicament/medicament.service'; 

@Injectable()
export class DemandeService {
  constructor(
    @InjectRepository(Demande)
    private repoDemande: Repository<Demande>, 
    @Inject(forwardRef(() => MedicamentService)) 
    private medicamentService: MedicamentService, 
  ) {}

  // ✅ MISE A JOUR : Ajout des arguments pointDeRepere et priorite
  async creerDemande(
    medicament: string, 
    lat: number, 
    lon: number, 
    paiement: string = 'ESPECES',
    pointDeRepere: string = '',
    priorite: 'STANDARD' | 'URGENT' = 'STANDARD'
  ) {
    // 1. Recherche ID Médicament
    const resultatsRecherche = await this.medicamentService.rechercher(medicament);
    const medicamentTrouve: any = resultatsRecherche.hits?.[0] || {};
    
    const codeSecret = Math.floor(1000 + Math.random() * 9000).toString();

    const nouvelleDemande = this.repoDemande.create({
      medicamentId: medicamentTrouve.id ? medicamentTrouve.id.toString() : '0', 
      medicamentNom: medicament,
      statut: 'EN_ATTENTE',
      modePaiement: paiement,
      // ✅ NOUVEAU : Enregistrement des données Pro
      pointDeRepere: pointDeRepere,
      priorite: priorite,
      codeRetrait: codeSecret, 
      positionClient: { type: 'Point', coordinates: [lon, lat] },
      positionLivreur: undefined, 
    });
    return await this.repoDemande.save(nouvelleDemande);
  }

  async listerToutes() {
    // ✅ OPTIMISATION : On trie d'abord par Priorité (URGENT en premier), puis par date
    const demandesBrutes = await this.repoDemande.find({ 
        order: { 
            priorite: 'DESC', // URGENT viendra avant STANDARD alphabétiquement (U > S)
            dateCreation: 'DESC' 
        } 
    });
    
    const resultats = await this.medicamentService.rechercher('');
    const medicamentsEnBase: any[] = resultats.hits;
    
    const demandesEnrichies = demandesBrutes.map(d => {
        const medicamentDetail = medicamentsEnBase.find(m => 
            m.id?.toString() === d.medicamentId || m.nomCommercial === d.medicamentNom
        );

        return {
            ...d,
            medicament: medicamentDetail || { nomCommercial: d.medicamentNom, dci: 'N/A', dosage: 'N/A', forme: 'N/A', prixReference: '?', surOrdonnance: false },
            client: { nomComplet: 'Client Mobile' }, 
            id_short: d.id.substring(0, 8),
            // ✅ UX : Un flag pour le front-end pour afficher une icône 🚨 si urgent
            isUrgent: d.priorite === 'URGENT'
        };
    });
    // Petit fix de tri manuel si nécessaire (URGENT en haut de pile)
    return demandesEnrichies.sort((a, b) => (a.priorite === 'URGENT' ? -1 : 1));
  }

  async trouverParId(id: string): Promise<Demande | null> {
    return await this.repoDemande.findOne({ where: { id: id } });
  }

  // ✅ MISE A JOUR : Calcul financier lors de l'acceptation
  async accepterDemande(idDemande: string, prixMedicament: number) {
    const demande = await this.repoDemande.findOne({ where: { id: idDemande } });
    
    if (demande) {
      demande.statut = 'ACCEPTEE'; 
      demande.pharmacieId = "pharmacie-demo-1";
      demande.pharmacieNom = "Pharmacie du Plateau";
      demande.positionPharmacie = { lat: 5.3260, lon: -4.0200 }; 
      
      // --- LOGIQUE FINANCIERE ---
      demande.prixMedicament = Number(prixMedicament); // S'assurer que c'est un nombre

      // Tarification dynamique selon la roadmap
      if (demande.priorite === 'URGENT') {
          demande.fraisLivraison = 3000; // Tarif Urgent
      } else {
          demande.fraisLivraison = 1500; // Tarif Standard
      }

      // Seuil de gratuité (Roadmap Page 9) : Si médicament > 25000, livraison standard offerte
      if (demande.prixMedicament > 25000 && demande.priorite === 'STANDARD') {
          demande.fraisLivraison = 0;
      }

      demande.totalAPayer = demande.prixMedicament + demande.fraisLivraison;
      // --------------------------

      return await this.repoDemande.save(demande);
    }
    return null;
  }

  async assignerLivreurADemande(idDemande: string, livreurId: string) {
    const demande = await this.repoDemande.findOne({ where: { id: idDemande } });
    if (demande && demande.statut === 'ACCEPTEE') {
      demande.statut = 'LIVRAISON_EN_COURS'; 
      demande.positionLivreur = demande.positionPharmacie; 
      (demande as any)['livreurId'] = livreurId; 
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
