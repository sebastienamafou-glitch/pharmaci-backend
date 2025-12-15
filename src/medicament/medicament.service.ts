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

    // 1. Configuration (On garde les filtres intelligents)
    console.log('Configuration de l\'index MeiliSearch...');
    await index.updateFilterableAttributes(['forme', 'surOrdonnance', 'categorie']);
    await index.updateSearchableAttributes(['nomCommercial', 'dci', 'codeCip', 'categorie', 'forme']);

    // 2. LA GROSSE LISTE (60+ Médicaments Réalistes)
    const baseMedicaments = [
      // --- ANTIPALUDÉENS (CRUCIAL EN CI) ---
      { codeCip: "34009400", nomCommercial: "COARTEM", dci: "Artéméther/Luméfantrine", dosage: "20/120 mg", forme: "Comprimé", prixReference: 3500, surOrdonnance: true, categorie: "Antipaludéen" },
      { codeCip: "34009401", nomCommercial: "MALAXIN", dci: "Dihydroartémisinine", dosage: "40/320 mg", forme: "Comprimé", prixReference: 4000, surOrdonnance: true, categorie: "Antipaludéen" },
      { codeCip: "34009402", nomCommercial: "ARTEFAN", dci: "Artéméther", dosage: "80 mg", forme: "Injectable", prixReference: 5000, surOrdonnance: true, categorie: "Antipaludéen" },
      { codeCip: "34009403", nomCommercial: "PLASMOTRIM", dci: "Artésunate", dosage: "50 mg", forme: "Comprimé", prixReference: 2800, surOrdonnance: true, categorie: "Antipaludéen" },
      { codeCip: "34009404", nomCommercial: "MALARONE", dci: "Atovaquone/Proguanil", dosage: "250/100 mg", forme: "Comprimé", prixReference: 12000, surOrdonnance: true, categorie: "Antipaludéen" },
      
      // --- DOULEUR & FIÈVRE ---
      { codeCip: "34009340", nomCommercial: "DOLIPRANE", dci: "Paracétamol", dosage: "1000 mg", forme: "Comprimé", prixReference: 1200, surOrdonnance: false, categorie: "Antalgique" },
      { codeCip: "34009341", nomCommercial: "DOLIPRANE SIROP", dci: "Paracétamol", dosage: "2.4%", forme: "Sirop", prixReference: 1800, surOrdonnance: false, categorie: "Antalgique" },
      { codeCip: "34009342", nomCommercial: "EFFERALGAN", dci: "Paracétamol", dosage: "1000 mg", forme: "Comprimé effervescent", prixReference: 1500, surOrdonnance: false, categorie: "Antalgique" },
      { codeCip: "34009343", nomCommercial: "DAFALGAN", dci: "Paracétamol", dosage: "500 mg", forme: "Gélule", prixReference: 1000, surOrdonnance: false, categorie: "Antalgique" },
      { codeCip: "34009344", nomCommercial: "NUROFEN", dci: "Ibuprofène", dosage: "400 mg", forme: "Comprimé", prixReference: 2500, surOrdonnance: false, categorie: "Anti-inflammatoire" },
      { codeCip: "34009345", nomCommercial: "ADVIL", dci: "Ibuprofène", dosage: "200 mg", forme: "Comprimé", prixReference: 1800, surOrdonnance: false, categorie: "Anti-inflammatoire" },
      { codeCip: "34009346", nomCommercial: "VOLTARENE", dci: "Diclofénac", dosage: "75 mg", forme: "Comprimé LP", prixReference: 4500, surOrdonnance: true, categorie: "Anti-inflammatoire" },

      // --- ANTIBIOTIQUES ---
      { codeCip: "34009500", nomCommercial: "AMOXICILLINE BIOGARAN", dci: "Amoxicilline", dosage: "500 mg", forme: "Gélule", prixReference: 2500, surOrdonnance: true, categorie: "Antibiotique" },
      { codeCip: "34009501", nomCommercial: "AUGMENTIN", dci: "Amoxicilline + Acide Clavulanique", dosage: "1g/125mg", forme: "Sachet", prixReference: 6500, surOrdonnance: true, categorie: "Antibiotique" },
      { codeCip: "34009502", nomCommercial: "CIFLOX", dci: "Ciprofloxacine", dosage: "500 mg", forme: "Comprimé", prixReference: 4200, surOrdonnance: true, categorie: "Antibiotique" },
      { codeCip: "34009503", nomCommercial: "FLAGYL", dci: "Métronidazole", dosage: "500 mg", forme: "Comprimé", prixReference: 2200, surOrdonnance: true, categorie: "Antibiotique" },
      { codeCip: "34009504", nomCommercial: "ORELOX", dci: "Cefpodoxime", dosage: "100 mg", forme: "Comprimé", prixReference: 5500, surOrdonnance: true, categorie: "Antibiotique" },
      { codeCip: "34009505", nomCommercial: "ZITHROMAX", dci: "Azithromycine", dosage: "250 mg", forme: "Comprimé", prixReference: 6000, surOrdonnance: true, categorie: "Antibiotique" },

      // --- DIGESTION & ESTOMAC ---
      { codeCip: "34009600", nomCommercial: "SPASFON", dci: "Phloroglucinol", dosage: "80 mg", forme: "Comprimé", prixReference: 2200, surOrdonnance: false, categorie: "Spasmodique" },
      { codeCip: "34009601", nomCommercial: "SMECTA", dci: "Diosmectite", dosage: "3g", forme: "Sachet", prixReference: 3500, surOrdonnance: false, categorie: "Digestion" },
      { codeCip: "34009602", nomCommercial: "VOGALIB", dci: "Métopimazine", dosage: "7.5 mg", forme: "Lyophilisat", prixReference: 4500, surOrdonnance: false, categorie: "Nausée" },
      { codeCip: "34009603", nomCommercial: "GAVISCON", dci: "Alginate de sodium", dosage: "500 mg", forme: "Sachet", prixReference: 3000, surOrdonnance: false, categorie: "Digestion" },
      { codeCip: "34009604", nomCommercial: "IMODIUM", dci: "Lopéramide", dosage: "2 mg", forme: "Gélule", prixReference: 2100, surOrdonnance: false, categorie: "Digestion" },
      { codeCip: "34009605", nomCommercial: "MOPRAL", dci: "Oméprazole", dosage: "20 mg", forme: "Gélule", prixReference: 4000, surOrdonnance: true, categorie: "Estomac" },
      { codeCip: "34009606", nomCommercial: "MAALOX", dci: "Hydroxyde d'alu", dosage: "400 mg", forme: "Comprimé", prixReference: 2800, surOrdonnance: false, categorie: "Estomac" },

      // --- MALADIES CHRONIQUES (TENSION / DIABÈTE) ---
      { codeCip: "34009850", nomCommercial: "AMLOR", dci: "Amlodipine", dosage: "5 mg", forme: "Gélule", prixReference: 6500, surOrdonnance: true, categorie: "Cardiologie" },
      { codeCip: "34009851", nomCommercial: "GLUCOPHAGE", dci: "Metformine", dosage: "1000 mg", forme: "Comprimé", prixReference: 3200, surOrdonnance: true, categorie: "Diabète" },
      { codeCip: "34009852", nomCommercial: "TAHOR", dci: "Atorvastatine", dosage: "10 mg", forme: "Comprimé", prixReference: 7000, surOrdonnance: true, categorie: "Cardiologie" },
      { codeCip: "34009853", nomCommercial: "LANTUS", dci: "Insuline Glargine", dosage: "100 U/ml", forme: "Stylo injectable", prixReference: 12000, surOrdonnance: true, categorie: "Diabète" },
      { codeCip: "34009854", nomCommercial: "KARDGIC", dci: "Acétylsalicylate", dosage: "75 mg", forme: "Sachet", prixReference: 1500, surOrdonnance: true, categorie: "Cardiologie" },

      // --- RHUME & GRIPPE ---
      { codeCip: "34009700", nomCommercial: "FERVEX", dci: "Paracétamol/Phéniramine", dosage: "500 mg", forme: "Sachet", prixReference: 3200, surOrdonnance: false, categorie: "Rhume" },
      { codeCip: "34009701", nomCommercial: "ACTIFED RHUME", dci: "Paracétamol/Pseudoéphédrine", dosage: "500/60 mg", forme: "Comprimé", prixReference: 2800, surOrdonnance: false, categorie: "Rhume" },
      { codeCip: "34009702", nomCommercial: "HUMEX RHUME", dci: "Paracétamol/Pseudoéphédrine", dosage: "500/60 mg", forme: "Comprimé", prixReference: 2900, surOrdonnance: false, categorie: "Rhume" },
      { codeCip: "34009703", nomCommercial: "VENTOLINE", dci: "Salbutamol", dosage: "100 µg", forme: "Inhalateur", prixReference: 3500, surOrdonnance: true, categorie: "Asthme" },
      { codeCip: "34009704", nomCommercial: "RHINADVIL", dci: "Ibuprofène/Pseudoéphédrine", dosage: "200/30 mg", forme: "Comprimé", prixReference: 3100, surOrdonnance: false, categorie: "Rhume" },

      // --- VITAMINES & PREMIERS SOINS ---
      { codeCip: "34009800", nomCommercial: "VITAMINE C UPSA", dci: "Acide ascorbique", dosage: "1000 mg", forme: "Comprimé effervescent", prixReference: 2000, surOrdonnance: false, categorie: "Vitamine" },
      { codeCip: "34009801", nomCommercial: "MAGNÉ B6", dci: "Magnésium/Vitamine B6", dosage: "48 mg", forme: "Comprimé", prixReference: 4500, surOrdonnance: false, categorie: "Vitamine" },
      { codeCip: "34009802", nomCommercial: "BÉTADINE JAUNE", dci: "Povidone iodée", dosage: "10%", forme: "Solution", prixReference: 1500, surOrdonnance: false, categorie: "Désinfectant" },
      { codeCip: "34009803", nomCommercial: "BÉTADINE ROUGE", dci: "Povidone iodée (Scrub)", dosage: "4%", forme: "Solution moussante", prixReference: 1500, surOrdonnance: false, categorie: "Désinfectant" },
      { codeCip: "34009804", nomCommercial: "BIAFINE", dci: "Trolamine", dosage: "186g", forme: "Emulsion", prixReference: 3800, surOrdonnance: false, categorie: "Peau" },
      { codeCip: "34009805", nomCommercial: "DAKIN", dci: "Hypochlorite de sodium", dosage: "500ml", forme: "Solution", prixReference: 1200, surOrdonnance: false, categorie: "Désinfectant" },

      // --- GYNECO & BEBE ---
      { codeCip: "34009900", nomCommercial: "PILULE DU LENDEMAIN", dci: "Lévonorgestrel", dosage: "1.5 mg", forme: "Comprimé unique", prixReference: 3500, surOrdonnance: false, categorie: "Gynécologie" },
      { codeCip: "34009901", nomCommercial: "ACIDE FOLIQUE", dci: "Acide Folique", dosage: "0.4 mg", forme: "Comprimé", prixReference: 1500, surOrdonnance: false, categorie: "Gynécologie" },
      { codeCip: "34009902", nomCommercial: "SERUM PHYSIOLOGIQUE", dci: "Chlorure de sodium", dosage: "5ml", forme: "Dosette", prixReference: 1000, surOrdonnance: false, categorie: "Bébé" },
      { codeCip: "34009903", nomCommercial: "MUSTELA", dci: "Gel lavant", dosage: "500ml", forme: "Gel", prixReference: 6000, surOrdonnance: false, categorie: "Bébé" },
    ];

    const documents = baseMedicaments.map((med, index) => ({
      id: index + 1,
      ...med
    }));

    console.log(`Envoi de ${documents.length} médicaments à Meilisearch...`);
    
    // Reset complet pour éviter les doublons
    await index.deleteAllDocuments();
    return await index.addDocuments(documents);
  }

  async rechercher(query: string) {
    const index = this.client.index('medicaments');
    return await index.search(query, {
        limit: 20, 
        attributesToHighlight: ['nomCommercial', 'dci'],
    });
  }
}
