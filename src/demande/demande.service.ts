import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Demande } from './demande.entity';
import { MedicamentService } from '../medicament/medicament.service'; 
import { HubsService } from '../hubs/hubs.service';

@Injectable()
export class DemandeService {
  constructor(
    @InjectRepository(Demande)
    private repoDemande: Repository<Demande>, 
    
    @Inject(forwardRef(() => MedicamentService)) 
    private medicamentService: MedicamentService,
    
    private hubsService: HubsService,
  ) {}

  // =================================================================
  // 1. CRÉATION D'UNE DEMANDE (CLIENT MOBILE)
  // =================================================================
  async creerDemande(medicament: string, lat: number, lon: number, paiement: string = 'ESPECES', pointDeRepere: string = '', priorite: 'STANDARD' | 'URGENT' = 'STANDARD') {
    // A. Recherche du médicament (pour récupérer l'ID si possible)
    const resultatsRecherche = await this.medicamentService.rechercher(medicament);
    const medicamentTrouve: any = resultatsRecherche.hits?.[0] || {};
    
    // B. Génération du code de retrait
    const codeSecret = Math.floor(1000 + Math.random() * 9000).toString();

    // C. INTELLIGENCE LOGISTIQUE : Trouver le Hub le plus proche
    const hubProche = await this.hubsService.trouverHubProche(lat, lon);

    // D. Création de l'objet Demande
    const nouvelleDemande = this.repoDemande.create({
      medicamentId: medicamentTrouve.id ? medicamentTrouve.id.toString() : '0', 
      medicamentNom: medicament,
      statut: 'EN_ATTENTE',
      modePaiement: paiement,
      pointDeRepere: pointDeRepere,
      priorite: priorite,
      codeRetrait: codeSecret, 
      
      // ✅ ASSIGNATION DU HUB AUTOMATIQUE
      hubId: hubProche ? hubProche.id : null,
      hubNom: hubProche ? hubProche.nom : 'Zone Hors Couverture',

      positionClient: { type: 'Point', coordinates: [lon, lat] },
      
      // ✅ CORRECTION ICI : Utiliser null au lieu de undefined
      positionLivreur: null, 
    });

    return await this.repoDemande.save(nouvelleDemande);
  }

  // =================================================================
  // 2. MÉTHODE PRIVÉE : CALCUL POSOLOGIE
  // =================================================================
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

  // =================================================================
  // 3. LISTER TOUTES LES DEMANDES (DASHBOARD)
  // =================================================================
  async listerToutes() {
    // On récupère les demandes triées par urgence puis par date
    const demandesBrutes = await this.repoDemande.find({ 
        order: { priorite: 'DESC', dateCreation: 'DESC' } 
    });
    
    // On récupère les infos médicaments pour enrichir l'affichage
    const resultats = await this.medicamentService.rechercher('');
    const medicamentsEnBase: any[] = resultats.hits;
    
    const demandesEnrichies = demandesBrutes.map(d => {
        const medicamentDetail = medicamentsEnBase.find(m => 
            m.id?.toString() === d.medicamentId || m.nomCommercial === d.medicamentNom
        );

        // Appel de la posologie
        const posologieCalculee = this._calculerPosologie(medicamentDetail);

        return {
            ...d,
            medicament: medicamentDetail || { nomCommercial: d.medicamentNom, dci: 'N/A', dosage: 'N/A', forme: 'N/A', prixReference: '?', surOrdonnance: false },
            client: { nomComplet: 'Client Mobile' }, 
            id_short: d.id.substring(0, 8),
            isUrgent: d.priorite === 'URGENT',
            posologie: posologieCalculee 
        };
    });
    
    return demandesEnrichies.sort((a, b) => (a.priorite === 'URGENT' ? -1 : 1));
  }

  // =================================================================
  // 4. TROUVER UNE DEMANDE PAR ID
  // =================================================================
  async trouverParId(id: string): Promise<Demande | null> {
    return await this.repoDemande.findOne({ where: { id: id } });
  }

  // =================================================================
  // 5. PHARMACIEN ACCEPTE LA DEMANDE
  // =================================================================
  async accepterDemande(idDemande: string, prixMedicament: number) {
    const demande = await this.repoDemande.findOne({ where: { id: idDemande } });
    
    if (demande) {
      demande.statut = 'ACCEPTEE'; 
      demande.pharmacieId = "pharmacie-demo-1";
      demande.pharmacieNom = "Pharmacie du Plateau";
      demande.positionPharmacie = { lat: 5.3260, lon: -4.0200 }; // Demo
      
      demande.prixMedicament = Number(prixMedicament); 
      
      // Logique frais de livraison
      if (demande.priorite === 'URGENT') {
          demande.fraisLivraison = 3000; 
      } else {
          demande.fraisLivraison = 1500; 
      }
      
      // Livraison offerte si > 25.000F et standard
      if (demande.prixMedicament > 25000 && demande.priorite === 'STANDARD') {
          demande.fraisLivraison = 0;
      }

      demande.totalAPayer = demande.prixMedicament + demande.fraisLivraison;
      
      return await this.repoDemande.save(demande);
    }
    return null;
  }

  // =================================================================
  // 6. ASSIGNER UN LIVREUR
  // =================================================================
  async assignerLivreurADemande(idDemande: string, livreurId: string) {
    const demande = await this.repoDemande.findOne({ where: { id: idDemande } });
    if (demande && demande.statut === 'ACCEPTEE') {
      demande.statut = 'LIVRAISON_EN_COURS'; 
      // Le livreur part de la pharmacie
      demande.positionLivreur = demande.positionPharmacie; 
      (demande as any)['livreurId'] = livreurId; 
      return await this.repoDemande.save(demande);
    }
    return null;
  }

  // =================================================================
  // 7. MISE A JOUR POSITION LIVREUR (GPS)
  // =================================================================
  async updateLivreurPosition(idDemande: string, lat: number, lon: number) {
    const demande = await this.repoDemande.findOne({ where: { id: idDemande } });
    if (demande && demande.statut === 'LIVRAISON_EN_COURS') {
      demande.positionLivreur = { lat, lon };
      return await this.repoDemande.save(demande);
    }
    return null;
  }
}
