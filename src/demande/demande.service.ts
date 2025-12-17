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
  // 1. CRÉATION D'UNE DEMANDE (CLIENT MOBILE) AVEC DISPATCHING
  // =================================================================
  async creerDemande(medicament: string, lat: number, lon: number, paiement: string = 'ESPECES', pointDeRepere: string = '', priorite: 'STANDARD' | 'URGENT' = 'STANDARD') {
    // A. Recherche du médicament pour enrichir la demande
    const resultatsRecherche = await this.medicamentService.rechercher(medicament);
    const medicamentTrouve: any = resultatsRecherche.hits?.[0] || {};
    
    // B. Génération d'un code de retrait aléatoire à 4 chiffres
    const codeSecret = Math.floor(1000 + Math.random() * 9000).toString();

    // ✅ C. INTELLIGENCE LOGISTIQUE : Dispatching vers le Hub le plus proche [cite: 1, 14]
    const hubProche = await this.hubsService.trouverHubProche(lat, lon);

    // D. Préparation de l'objet (Typé en any pour éviter les erreurs TS strictes de Render) 
    const donneesDemande: any = {
      medicamentId: medicamentTrouve.id ? medicamentTrouve.id.toString() : '0', 
      medicamentNom: medicament,
      
      // ✅ Si aucun hub ne couvre la zone, on marque 'HORS_ZONE'
      statut: hubProche ? 'EN_ATTENTE' : 'HORS_ZONE',
      
      modePaiement: paiement,
      pointDeRepere: pointDeRepere,
      priorite: priorite,
      codeRetrait: codeSecret, 
      
      // ✅ Assignation des infos du Hub détecté [cite: 1, 14]
      hubId: hubProche ? hubProche.id : null,
      hubNom: hubProche ? hubProche.nom : 'Zone Hors Couverture',

      // ✅ Géolocalisation client [cite: 1]
      positionClient: { type: 'Point', coordinates: [lon, lat] },
      lat: lat,
      lon: lon,
      
      // ✅ Initialisations obligatoires pour la base de données [cite: 1]
      positionLivreur: null,
      positionPharmacie: null,
      pharmacieId: null,
      pharmacieNom: null,
      prixMedicament: 0,
      fraisLivraison: 0,
      totalAPayer: 0
    };

    const nouvelleDemande = this.repoDemande.create(donneesDemande);
    const demandeSauvegardee = await this.repoDemande.save(nouvelleDemande);

    // ✅ Correction des Logs pour éviter les erreurs TS de type "undefined" 
    if (!hubProche) {
      console.log(`⚠️ Alerte : Demande créée hors zone de couverture.`);
    } else {
      console.log(`📍 Demande assignée au hub : ${hubProche.nom}`);
    }

    return demandeSauvegardee;
  }

  // =================================================================
  // 2. MÉTHODE PRIVÉE : CALCUL POSOLOGIE
  // =================================================================
  private _calculerPosologie(med: any): string {
    if (!med || !med.forme) return "Se conformer à l'ordonnance";

    const forme = med.forme.toLowerCase();
    const cat = med.categorie ? med.categorie.toLowerCase() : '';

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
    const demandesBrutes = await this.repoDemande.find({ 
        order: { priorite: 'DESC', dateCreation: 'DESC' } 
    });
    
    const resultats = await this.medicamentService.rechercher('');
    const medicamentsEnBase: any[] = resultats.hits;
    
    const demandesEnrichies = demandesBrutes.map(d => {
        const medicamentDetail = medicamentsEnBase.find(m => 
            m.id?.toString() === d.medicamentId || m.nomCommercial === d.medicamentNom
        );

        const posologieCalculee = this._calculerPosologie(medicamentDetail);

        return {
            ...d,
            medicament: medicamentDetail || { nomCommercial: d.medicamentNom, dci: 'N/A', dosage: 'N/A', forme: 'N/A', prixReference: '?', surOrdonnance: false },
            client: { nomComplet: 'Client Mobile' }, 
            id_short: d.id ? d.id.substring(0, 8) : 'N/A',
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
      demande.positionPharmacie = { lat: 5.3260, lon: -4.0200 }; 
      
      demande.prixMedicament = Number(prixMedicament); 
      
      if (demande.priorite === 'URGENT') {
          demande.fraisLivraison = 3000; 
      } else {
          demande.fraisLivraison = 1500; 
      }
      
      if (demande.prixMedicament > 25000 && demande.priorite === 'STANDARD') {
          demande.fraisLivraison = 0;
      }

      demande.totalAPayer = (demande.prixMedicament || 0) + (demande.fraisLivraison || 0);
      
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
      demande.positionLivreur = demande.positionPharmacie; 
      demande.livreurId = livreurId; 
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
