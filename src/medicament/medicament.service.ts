import { Injectable } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import { InjectMeiliSearch } from 'nestjs-meilisearch';

@Injectable()
export class MedicamentService {
  constructor(
    @InjectMeiliSearch() private readonly client: MeiliSearch
  ) {}

  async chargerDonneesInitiales() {
    const index = this.client.index('medicaments');

    // 1. Configuration de la recherche (Tris et Filtres)
    console.log('Configuration de l\'index MeiliSearch...');
    
    // On veut pouvoir filtrer par forme (ex: Sirop) et statut (Ordonnance)
    await index.updateFilterableAttributes(['forme', 'surOrdonnance']);
    
    // On veut chercher dans le nom, la molécule (DCI) et le code
    await index.updateSearchableAttributes(['nomCommercial', 'dci', 'codeCip']);

    // 2. Les Données (Seed) - 30 Médicaments courants en CI
    const baseMedicaments = [
      // DOULEUR & FIÈVRE
      { codeCip: "34009340", nomCommercial: "DOLIPRANE", dci: "Paracétamol", dosage: "1000 mg", forme: "Comprimé", prixReference: 1200, surOrdonnance: false },
      { codeCip: "34009341", nomCommercial: "DOLIPRANE SIROP", dci: "Paracétamol", dosage: "2.4%", forme: "Sirop", prixReference: 1800, surOrdonnance: false },
      { codeCip: "34009342", nomCommercial: "EFFERALGAN", dci: "Paracétamol", dosage: "1000 mg", forme: "Comprimé effervescent", prixReference: 1500, surOrdonnance: false },
      { codeCip: "34009343", nomCommercial: "DAFALGAN", dci: "Paracétamol", dosage: "500 mg", forme: "Gélule", prixReference: 1000, surOrdonnance: false },
      
      // ANTIPALUDÉENS (PALU)
      { codeCip: "34009400", nomCommercial: "COARTEM", dci: "Artéméther/Luméfantrine", dosage: "20/120 mg", forme: "Comprimé", prixReference: 3500, surOrdonnance: true },
      { codeCip: "34009401", nomCommercial: "MALAXIN", dci: "Dihydroartémisinine", dosage: "40/320 mg", forme: "Comprimé", prixReference: 4000, surOrdonnance: true },
      { codeCip: "34009402", nomCommercial: "ARTEFAN", dci: "Artéméther", dosage: "80 mg", forme: "Injectable", prixReference: 5000, surOrdonnance: true },

      // ANTIBIOTIQUES
      { codeCip: "34009500", nomCommercial: "AMOXICILLINE BIOGARAN", dci: "Amoxicilline", dosage: "500 mg", forme: "Gélule", prixReference: 2500, surOrdonnance: true },
      { codeCip: "34009501", nomCommercial: "AUGMENTIN", dci: "Amoxicilline + Acide Clavulanique", dosage: "1g/125mg", forme: "Sachet", prixReference: 6500, surOrdonnance: true },
      { codeCip: "34009502", nomCommercial: "CIPROFLOXACINE", dci: "Ciprofloxacine", dosage: "500 mg", forme: "Comprimé", prixReference: 3000, surOrdonnance: true },
      { codeCip: "34009503", nomCommercial: "FLAGYL", dci: "Métronidazole", dosage: "500 mg", forme: "Comprimé", prixReference: 2200, surOrdonnance: true },

      // DIGESTION
      { codeCip: "34009600", nomCommercial: "SPASFON", dci: "Phloroglucinol", dosage: "80 mg", forme: "Comprimé", prixReference: 2200, surOrdonnance: false },
      { codeCip: "34009601", nomCommercial: "SMECTA", dci: "Diosmectite", dosage: "3g", forme: "Sachet", prixReference: 3500, surOrdonnance: false },
      { codeCip: "34009602", nomCommercial: "VOGALIB", dci: "Métopimazine", dosage: "7.5 mg", forme: "Lyophilisat", prixReference: 4500, surOrdonnance: false },
      { codeCip: "34009603", nomCommercial: "GAVISCON", dci: "Alginate de sodium", dosage: "500 mg", forme: "Sachet", prixReference: 3000, surOrdonnance: false },

      // RHUME & GRIPPE
      { codeCip: "34009700", nomCommercial: "FERVEX", dci: "Paracétamol/Phéniramine", dosage: "500 mg", forme: "Sachet", prixReference: 3200, surOrdonnance: false },
      { codeCip: "34009701", nomCommercial: "ACTIFED RHUME", dci: "Paracétamol/Pseudoéphédrine", dosage: "500/60 mg", forme: "Comprimé", prixReference: 2800, surOrdonnance: false },
      { codeCip: "34009702", nomCommercial: "HUMEX RHUME", dci: "Paracétamol/Pseudoéphédrine", dosage: "500/60 mg", forme: "Comprimé", prixReference: 2900, surOrdonnance: false },

      // VITAMINES & DIVERS
      { codeCip: "34009800", nomCommercial: "VITAMINE C UPSA", dci: "Acide ascorbique", dosage: "1000 mg", forme: "Comprimé effervescent", prixReference: 2000, surOrdonnance: false },
      { codeCip: "34009801", nomCommercial: "MAGNÉ B6", dci: "Magnésium/Vitamine B6", dosage: "48 mg", forme: "Comprimé", prixReference: 4500, surOrdonnance: false },
      { codeCip: "34009802", nomCommercial: "BÉTADINE JAUNE", dci: "Povidone iodée", dosage: "10%", forme: "Solution", prixReference: 1500, surOrdonnance: false },
    ];

    // Ajout d'un ID auto-incrémenté pour MeiliSearch (nécessaire pour l'indexation)
    const documents = baseMedicaments.map((med, index) => ({
      id: index + 1,
      ...med
    }));

    console.log(`Envoi de ${documents.length} médicaments à Meilisearch...`);
    
    // Supprime les anciens documents pour repartir au propre
    await index.deleteAllDocuments();
    
    // Ajoute les nouveaux
    return await index.addDocuments(documents);
  }

  async rechercher(query: string) {
    const index = this.client.index('medicaments');
    return await index.search(query, {
        limit: 20, // On augmente un peu la limite
        attributesToHighlight: ['nomCommercial', 'dci'], // Pour mettre en gras ce qui matche
    });
  }
}
