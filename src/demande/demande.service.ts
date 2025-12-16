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

  // 1. Création d'une demande par le client mobile
  async creerDemande(medicament: string, lat: number, lon: number, paiement: string = 'ESPECES', pointDeRepere: string = '', priorite: 'STANDARD' | 'URGENT' = 'STANDARD') {
    // Recherche du médicament pour avoir son ID (si dispo)
    const resultatsRecherche = await this.medicamentService.rechercher(medicament);
    const medicamentTrouve: any = resultatsRecherche.hits?.[0] || {};
    
    // Génération d'un code de retrait simple
    const codeSecret = Math.floor(1000 + Math.random() * 9000).toString();

    const nouvelleDemande = this.repoDemande.create({
      medicamentId: medicamentTrouve.id ? medicamentTrouve.id.toString() : '0', 
      medicamentNom: medicament,
      statut: 'EN_ATTENTE',
      modePaiement: paiement,
      pointDeRepere: pointDeRepere,
      priorite: priorite,
      codeRetrait: codeSecret, 
      positionClient: { type: 'Point', coordinates: [lon, lat] },
      positionLivreur: undefined, // Pas encore de livreur
    });
    return await this.repoDemande.save(nouvelleDemande);
  }

  // ✅ NOUVELLE MÉTHODE PRIVÉE : Calcul de posologie
  private _calculerPosologie(med: any): string {
    if (!med || !med.forme) return "Se conformer à l'ordonnance";

    const forme = med.forme.toLowerCase();
    const cat = med.categorie ? med.categorie.toLowerCase() : '';

    // Règles métier basiques
    if (cat.includes('antipaludéen')) return "Traitement complet sur 3 jours (selon poids)";
    if (cat.includes('antibiotique')) return "1 comprimé matin et soir pendant 7 jours";
    if (cat.includes('antalgique') && forme.includes('comprimé')) return "1 comprimé toutes les 6h en cas de douleur";
    if (forme.includes('sirop')) return "1 cuillère doseuse 3 fois par jour";
    if (forme.includes('crème') || forme.includes('pommade')) return "Application locale 2 fois par jour";
    if (forme.includes('injectable')) return "Administration par un professionnel de santé";
    
    return "1 prise par jour ou selon avis médical";
  }

  // 2. Liste toutes les demandes (Enrichie avec la posologie)
  async listerToutes() {
    const demandesBrutes = await this.repoDemande.find({ 
        order: { priorite: 'DESC', dateCreation: 'DESC' } 
    });
    
    // On récupère TOUS les médicaments pour faire la jointure manuelle (Optimisation possible plus tard)
    const resultats = await this.medicamentService.rechercher('');
    const medicamentsEnBase: any[] = resultats.hits;
    
    const demandesEnrichies = demandesBrutes.map(d => {
        const medicamentDetail = medicamentsEnBase.find(m => 
            m.id?.toString() === d.medicamentId || m.nomCommercial === d.medicamentNom
        );

        // ✅ APPEL DE LA POSOLOGIE ICI
        const posologieCalculee = this._calculerPosologie(medicamentDetail);

        return {
            ...d,
            medicament: medicamentDetail || { nomCommercial: d.medicamentNom, dci: 'N/A', dosage: 'N/A', forme: 'N/A', prixReference: '?', surOrdonnance: false },
            client: { nomComplet: 'Client Mobile' }, 
            id_short: d.id.substring(0, 8),
            isUrgent: d.priorite === 'URGENT',
            // ✅ NOUVEAU CHAMP
            posologie: posologieCalculee 
        };
    });
    
    return demandesEnrichies.sort((a, b) => (a.priorite === 'URGENT' ? -1 : 1));
  }

  // 3. Trouver une demande spécifique
  async trouverParId(id: string): Promise<Demande | null> {
    return await this.repoDemande.findOne({ where: { id: id } });
  }

  // 4. Pharmacien accepte la demande et fixe le prix
  async accepterDemande(idDemande: string, prixMedicament: number) {
    const demande = await this.repoDemande.findOne({ where: { id: idDemande } });
    
    if (demande) {
      demande.statut = 'ACCEPTEE'; 
      demande.pharmacieId = "pharmacie-demo-1";
      demande.pharmacieNom = "Pharmacie du Plateau";
      demande.positionPharmacie = { lat: 5.3260, lon: -4.0200 }; // Coordonnées fixes pour démo
      
      demande.prixMedicament = Number(prixMedicament); 
      
      // Logique frais de livraison
      if (demande.priorite === 'URGENT') {
          demande.fraisLivraison = 3000; 
      } else {
          demande.fraisLivraison = 1500; 
      }
      
      // Livraison offerte si > 25000 et standard
      if (demande.prixMedicament > 25000 && demande.priorite === 'STANDARD') {
          demande.fraisLivraison = 0;
      }

      demande.totalAPayer = demande.prixMedicament + demande.fraisLivraison;
      
      return await this.repoDemande.save(demande);
    }
    return null;
  }

  // 5. Assigner un livreur
  async assignerLivreurADemande(idDemande: string, livreurId: string) {
    const demande = await this.repoDemande.findOne({ where: { id: idDemande } });
    if (demande && demande.statut === 'ACCEPTEE') {
      demande.statut = 'LIVRAISON_EN_COURS'; 
      // Au début, le livreur est à la pharmacie
      demande.positionLivreur = demande.positionPharmacie; 
      (demande as any)['livreurId'] = livreurId; 
      return await this.repoDemande.save(demande);
    }
    return null;
  }

  // 6. Mise à jour position livreur (GPS)
  async updateLivreurPosition(idDemande: string, lat: number, lon: number) {
    const demande = await this.repoDemande.findOne({ where: { id: idDemande } });
    if (demande && demande.statut === 'LIVRAISON_EN_COURS') {
      demande.positionLivreur = { lat, lon };
      return await this.repoDemande.save(demande);
    }
    return null;
  }
}
