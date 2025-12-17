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
      { codeCip: "34009405", nomCommercial: "DUOCOTRXECIN", dci: "Dihydroartémisinine", dosage: "40/320 mg", forme: "Comprimé", prixReference: 3800, surOrdonnance: true, categorie: "Antipaludéen" },
      { codeCip: "34009406", nomCommercial: "ARTEQUIN", dci: "Artésunate/Mefloquine", dosage: "600/750 mg", forme: "Comprimé", prixReference: 4500, surOrdonnance: true, categorie: "Antipaludéen" },

      // --- DOULEUR & FIÈVRE ---
      { codeCip: "34009340", nomCommercial: "DOLIPRANE", dci: "Paracétamol", dosage: "1000 mg", forme: "Comprimé", prixReference: 1200, surOrdonnance: false, categorie: "Antalgique" },
      { codeCip: "34009341", nomCommercial: "DOLIPRANE SIROP", dci: "Paracétamol", dosage: "2.4%", forme: "Sirop", prixReference: 1800, surOrdonnance: false, categorie: "Antalgique" },
      { codeCip: "34009342", nomCommercial: "EFFERALGAN", dci: "Paracétamol", dosage: "1000 mg", forme: "Comprimé effervescent", prixReference: 1500, surOrdonnance: false, categorie: "Antalgique" },
      { codeCip: "34009343", nomCommercial: "DAFALGAN", dci: "Paracétamol", dosage: "500 mg", forme: "Gélule", prixReference: 1000, surOrdonnance: false, categorie: "Antalgique" },
      { codeCip: "34009344", nomCommercial: "NUROFEN", dci: "Ibuprofène", dosage: "400 mg", forme: "Comprimé", prixReference: 2500, surOrdonnance: false, categorie: "Anti-inflammatoire" },
      { codeCip: "34009345", nomCommercial: "ADVIL", dci: "Ibuprofène", dosage: "200 mg", forme: "Comprimé", prixReference: 1800, surOrdonnance: false, categorie: "Anti-inflammatoire" },
      { codeCip: "34009346", nomCommercial: "VOLTARENE", dci: "Diclofénac", dosage: "75 mg", forme: "Comprimé LP", prixReference: 4500, surOrdonnance: true, categorie: "Anti-inflammatoire" },
      { codeCip: "34009347", nomCommercial: "IXPRIM", dci: "Tramadol/Paracétamol", dosage: "37.5/325 mg", forme: "Comprimé", prixReference: 3500, surOrdonnance: true, categorie: "Antalgique Fort" },
      { codeCip: "34009348", nomCommercial: "TOPALGIC", dci: "Tramadol", dosage: "50 mg", forme: "Gélule", prixReference: 2800, surOrdonnance: true, categorie: "Antalgique Fort" },
      { codeCip: "34009349", nomCommercial: "BREXIN", dci: "Piroxicam", dosage: "20 mg", forme: "Comprimé", prixReference: 3800, surOrdonnance: true, categorie: "Anti-inflammatoire" },
      { codeCip: "34009350", nomCommercial: "PARALGIN", dci: "Paracétamol/Caféine", dosage: "500/50 mg", forme: "Comprimé", prixReference: 1300, surOrdonnance: false, categorie: "Antalgique" },

      // --- ANTIBIOTIQUES ---
      { codeCip: "34009500", nomCommercial: "AMOXICILLINE BIOGARAN", dci: "Amoxicilline", dosage: "500 mg", forme: "Gélule", prixReference: 2500, surOrdonnance: true, categorie: "Antibiotique" },
      { codeCip: "34009501", nomCommercial: "AUGMENTIN", dci: "Amoxicilline + Acide Clavulanique", dosage: "1g/125mg", forme: "Sachet", prixReference: 6500, surOrdonnance: true, categorie: "Antibiotique" },
      { codeCip: "34009502", nomCommercial: "CIFLOX", dci: "Ciprofloxacine", dosage: "500 mg", forme: "Comprimé", prixReference: 4200, surOrdonnance: true, categorie: "Antibiotique" },
      { codeCip: "34009503", nomCommercial: "FLAGYL", dci: "Métronidazole", dosage: "500 mg", forme: "Comprimé", prixReference: 2200, surOrdonnance: true, categorie: "Antibiotique" },
      { codeCip: "34009504", nomCommercial: "ORELOX", dci: "Cefpodoxime", dosage: "100 mg", forme: "Comprimé", prixReference: 5500, surOrdonnance: true, categorie: "Antibiotique" },
      { codeCip: "34009505", nomCommercial: "ZITHROMAX", dci: "Azithromycine", dosage: "250 mg", forme: "Comprimé", prixReference: 6000, surOrdonnance: true, categorie: "Antibiotique" },
      { codeCip: "34009506", nomCommercial: "ROCEPHINE", dci: "Ceftriaxone", dosage: "1 g", forme: "Injectable IM/IV", prixReference: 5500, surOrdonnance: true, categorie: "Antibiotique" },
      { codeCip: "34009507", nomCommercial: "CLAMOXYL", dci: "Amoxicilline", dosage: "1 g", forme: "Comprimé dispersible", prixReference: 3200, surOrdonnance: true, categorie: "Antibiotique" },
      { codeCip: "34009508", nomCommercial: "PYOSTACINE", dci: "Pristinamycine", dosage: "500 mg", forme: "Comprimé", prixReference: 7500, surOrdonnance: true, categorie: "Antibiotique" },
      { codeCip: "34009509", nomCommercial: "DOXYCYCLINE", dci: "Doxycycline", dosage: "100 mg", forme: "Comprimé", prixReference: 2000, surOrdonnance: true, categorie: "Antibiotique" },

      // --- TOUX, GORGE & RHUME (NOUVELLE SECTION) ---
      { codeCip: "34009700", nomCommercial: "FERVEX", dci: "Paracétamol/Phéniramine", dosage: "500 mg", forme: "Sachet", prixReference: 3200, surOrdonnance: false, categorie: "Rhume" },
      { codeCip: "34009701", nomCommercial: "ACTIFED RHUME", dci: "Paracétamol/Pseudoéphédrine", dosage: "500/60 mg", forme: "Comprimé", prixReference: 2800, surOrdonnance: false, categorie: "Rhume" },
      { codeCip: "34009702", nomCommercial: "HUMEX RHUME", dci: "Paracétamol/Pseudoéphédrine", dosage: "500/60 mg", forme: "Comprimé", prixReference: 2900, surOrdonnance: false, categorie: "Rhume" },
      { codeCip: "34009703", nomCommercial: "VENTOLINE", dci: "Salbutamol", dosage: "100 µg", forme: "Inhalateur", prixReference: 3500, surOrdonnance: true, categorie: "Asthme" },
      { codeCip: "34009706", nomCommercial: "TOPLEXIL", dci: "Oxomémazine", dosage: "0.33 mg/ml", forme: "Sirop", prixReference: 2500, surOrdonnance: false, categorie: "Toux" },
      { codeCip: "34009707", nomCommercial: "BRONCHOKOD", dci: "Carbocistéine", dosage: "5%", forme: "Sirop", prixReference: 2200, surOrdonnance: false, categorie: "Toux" },
      { codeCip: "34009708", nomCommercial: "HELICIDINE", dci: "Hélicidine", dosage: "10%", forme: "Sirop", prixReference: 3000, surOrdonnance: false, categorie: "Toux" },
      { codeCip: "34009709", nomCommercial: "DRILL", dci: "Chlorhexidine/Tétracaïne", dosage: "Standard", forme: "Pastille", prixReference: 1800, surOrdonnance: false, categorie: "Gorge" },
      { codeCip: "34009710", nomCommercial: "HEXASPRAY", dci: "Biclotymol", dosage: "2.5%", forme: "Spray", prixReference: 2600, surOrdonnance: false, categorie: "Gorge" },
      { codeCip: "34009711", nomCommercial: "MAXILASE", dci: "Alpha-amylase", dosage: "3000 U", forme: "Comprimé", prixReference: 2100, surOrdonnance: false, categorie: "Gorge" },

      // --- DIGESTION & ESTOMAC ---
      { codeCip: "34009600", nomCommercial: "SPASFON", dci: "Phloroglucinol", dosage: "80 mg", forme: "Comprimé", prixReference: 2200, surOrdonnance: false, categorie: "Spasmodique" },
      { codeCip: "34009601", nomCommercial: "SMECTA", dci: "Diosmectite", dosage: "3g", forme: "Sachet", prixReference: 3500, surOrdonnance: false, categorie: "Digestion" },
      { codeCip: "34009602", nomCommercial: "VOGALIB", dci: "Métopimazine", dosage: "7.5 mg", forme: "Lyophilisat", prixReference: 4500, surOrdonnance: false, categorie: "Nausée" },
      { codeCip: "34009603", nomCommercial: "GAVISCON", dci: "Alginate de sodium", dosage: "500 mg", forme: "Sachet", prixReference: 3000, surOrdonnance: false, categorie: "Digestion" },
      { codeCip: "34009604", nomCommercial: "IMODIUM", dci: "Lopéramide", dosage: "2 mg", forme: "Gélule", prixReference: 2100, surOrdonnance: false, categorie: "Digestion" },
      { codeCip: "34009605", nomCommercial: "MOPRAL", dci: "Oméprazole", dosage: "20 mg", forme: "Gélule", prixReference: 4000, surOrdonnance: true, categorie: "Estomac" },
      { codeCip: "34009606", nomCommercial: "MAALOX", dci: "Hydroxyde d'alu", dosage: "400 mg", forme: "Comprimé", prixReference: 2800, surOrdonnance: false, categorie: "Estomac" },
      { codeCip: "34009608", nomCommercial: "METEOSPASMYL", dci: "Alvérine/Siméticone", dosage: "60/300 mg", forme: "Gélule", prixReference: 3800, surOrdonnance: false, categorie: "Digestion" },
      { codeCip: "34009609", nomCommercial: "INEXIUM", dci: "Esoméprazole", dosage: "40 mg", forme: "Comprimé", prixReference: 5500, surOrdonnance: true, categorie: "Estomac" },
      { codeCip: "34009610", nomCommercial: "CITRATE DE BETAINE", dci: "Bétaïne", dosage: "2 g", forme: "Comprimé effervescent", prixReference: 3000, surOrdonnance: false, categorie: "Digestion" },
      { codeCip: "34010100", nomCommercial: "ZENTEL", dci: "Albendazole", dosage: "400 mg", forme: "Comprimé", prixReference: 800, surOrdonnance: false, categorie: "Antiparasitaire" },
      { codeCip: "34010101", nomCommercial: "VERMOX", dci: "Mébendazole", dosage: "100 mg", forme: "Comprimé", prixReference: 1200, surOrdonnance: false, categorie: "Antiparasitaire" },

      // --- MALADIES CHRONIQUES (TENSION / DIABÈTE) ---
      { codeCip: "34009850", nomCommercial: "AMLOR", dci: "Amlodipine", dosage: "5 mg", forme: "Gélule", prixReference: 6500, surOrdonnance: true, categorie: "Cardiologie" },
      { codeCip: "34009851", nomCommercial: "GLUCOPHAGE", dci: "Metformine", dosage: "1000 mg", forme: "Comprimé", prixReference: 3200, surOrdonnance: true, categorie: "Diabète" },
      { codeCip: "34009852", nomCommercial: "TAHOR", dci: "Atorvastatine", dosage: "10 mg", forme: "Comprimé", prixReference: 7000, surOrdonnance: true, categorie: "Cardiologie" },
      { codeCip: "34009853", nomCommercial: "LANTUS", dci: "Insuline Glargine", dosage: "100 U/ml", forme: "Stylo injectable", prixReference: 12000, surOrdonnance: true, categorie: "Diabète" },
      { codeCip: "34009854", nomCommercial: "KARDGIC", dci: "Acétylsalicylate", dosage: "75 mg", forme: "Sachet", prixReference: 1500, surOrdonnance: true, categorie: "Cardiologie" },
      { codeCip: "34009855", nomCommercial: "LASILIX", dci: "Furosémide", dosage: "40 mg", forme: "Comprimé", prixReference: 1800, surOrdonnance: true, categorie: "Cardiologie" },
      { codeCip: "34009856", nomCommercial: "DIAMICRON", dci: "Gliclazide", dosage: "60 mg", forme: "Comprimé LP", prixReference: 4500, surOrdonnance: true, categorie: "Diabète" },
      { codeCip: "34009857", nomCommercial: "CO-RENITEC", dci: "Enalapril/HCT", dosage: "20/12.5 mg", forme: "Comprimé", prixReference: 5800, surOrdonnance: true, categorie: "Cardiologie" },
      { codeCip: "34009858", nomCommercial: "LOXEN", dci: "Nicardipine", dosage: "20 mg", forme: "Comprimé", prixReference: 3400, surOrdonnance: true, categorie: "Cardiologie" },
      { codeCip: "34009859", nomCommercial: "GLUCOR", dci: "Acarbose", dosage: "50 mg", forme: "Comprimé", prixReference: 3100, surOrdonnance: true, categorie: "Diabète" },

      // --- DERMATOLOGIE (PEAU) ---
      { codeCip: "34010200", nomCommercial: "KETODERM", dci: "Kétoconazole", dosage: "2%", forme: "Crème", prixReference: 2500, surOrdonnance: true, categorie: "Dermatologie" },
      { codeCip: "34010201", nomCommercial: "DIPROSONE", dci: "Bétaméthasone", dosage: "0.05%", forme: "Crème", prixReference: 1800, surOrdonnance: true, categorie: "Dermatologie" },
      { codeCip: "34010202", nomCommercial: "MYCOSTER", dci: "Ciclopirox", dosage: "1%", forme: "Crème", prixReference: 3100, surOrdonnance: false, categorie: "Dermatologie" },
      { codeCip: "34010203", nomCommercial: "LOCAPRED", dci: "Désonide", dosage: "0.1%", forme: "Crème", prixReference: 2200, surOrdonnance: true, categorie: "Dermatologie" },
      { codeCip: "34010204", nomCommercial: "EC0NAZOLE", dci: "Econazole", dosage: "1%", forme: "Crème", prixReference: 1500, surOrdonnance: false, categorie: "Dermatologie" },
      { codeCip: "34010205", nomCommercial: "FUCIDINE", dci: "Acide fusidique", dosage: "2%", forme: "Crème", prixReference: 3200, surOrdonnance: true, categorie: "Dermatologie" },

      // --- OPHTALMOLOGIE (YEUX) ---
      { codeCip: "34010300", nomCommercial: "DACRYOSERUM", dci: "Borax/Acide Borique", dosage: "10ml", forme: "Solution", prixReference: 1500, surOrdonnance: false, categorie: "Ophtalmologie" },
      { codeCip: "34010301", nomCommercial: "RIFAMYCINE", dci: "Rifamycine", dosage: "10ml", forme: "Collyre", prixReference: 1800, surOrdonnance: true, categorie: "Ophtalmologie" },
      { codeCip: "34010302", nomCommercial: "TOBREX", dci: "Tobramycine", dosage: "0.3%", forme: "Collyre", prixReference: 3500, surOrdonnance: true, categorie: "Ophtalmologie" },

      // --- SANTÉ MASCULINE & FÉMININE (GYNECO) ---
      { codeCip: "34010400", nomCommercial: "VIAGRA", dci: "Sildénafil", dosage: "100 mg", forme: "Comprimé", prixReference: 8000, surOrdonnance: true, categorie: "Santé Sexuelle" },
      { codeCip: "34010401", nomCommercial: "CIALIS", dci: "Tadalafil", dosage: "20 mg", forme: "Comprimé", prixReference: 9500, surOrdonnance: true, categorie: "Santé Sexuelle" },
      { codeCip: "34009900", nomCommercial: "NORLEVO (LENDEMAIN)", dci: "Lévonorgestrel", dosage: "1.5 mg", forme: "Comprimé unique", prixReference: 3500, surOrdonnance: false, categorie: "Gynécologie" },
      { codeCip: "34009901", nomCommercial: "ACIDE FOLIQUE", dci: "Acide Folique", dosage: "0.4 mg", forme: "Comprimé", prixReference: 1500, surOrdonnance: false, categorie: "Gynécologie" },
      { codeCip: "34009905", nomCommercial: "MERCILON", dci: "Désogestrel/Ethinyl.", dosage: "Standard", forme: "Plaquette", prixReference: 2000, surOrdonnance: true, categorie: "Contraception" },
      { codeCip: "34009906", nomCommercial: "JASMINE", dci: "Drospirénone/Ethinyl.", dosage: "Standard", forme: "Plaquette", prixReference: 6500, surOrdonnance: true, categorie: "Contraception" },
      { codeCip: "34009907", nomCommercial: "DUPHASTON", dci: "Dydrogestérone", dosage: "10 mg", forme: "Comprimé", prixReference: 4500, surOrdonnance: true, categorie: "Gynécologie" },
      { codeCip: "34009908", nomCommercial: "POLYGYNAX", dci: "Néomycine/Polymyxine", dosage: "Standard", forme: "Ovule", prixReference: 3500, surOrdonnance: true, categorie: "Gynécologie" },

      // --- VITAMINES, MINÉRAUX & BÉBÉ ---
      { codeCip: "34009800", nomCommercial: "VITAMINE C UPSA", dci: "Acide ascorbique", dosage: "1000 mg", forme: "Comprimé effervescent", prixReference: 2000, surOrdonnance: false, categorie: "Vitamine" },
      { codeCip: "34009801", nomCommercial: "MAGNÉ B6", dci: "Magnésium/Vitamine B6", dosage: "48 mg", forme: "Comprimé", prixReference: 4500, surOrdonnance: false, categorie: "Vitamine" },
      { codeCip: "34009806", nomCommercial: "BEROCCA", dci: "Multivitamines", dosage: "Standard", forme: "Comprimé effervescent", prixReference: 6000, surOrdonnance: false, categorie: "Vitamine" },
      { codeCip: "34009807", nomCommercial: "TARDYFERON", dci: "Fer", dosage: "80 mg", forme: "Comprimé", prixReference: 2200, surOrdonnance: false, categorie: "Vitamine" },
      { codeCip: "34009802", nomCommercial: "BÉTADINE JAUNE", dci: "Povidone iodée", dosage: "10%", forme: "Solution", prixReference: 1500, surOrdonnance: false, categorie: "Désinfectant" },
      { codeCip: "34009803", nomCommercial: "BÉTADINE ROUGE", dci: "Povidone iodée (Scrub)", dosage: "4%", forme: "Solution moussante", prixReference: 1500, surOrdonnance: false, categorie: "Désinfectant" },
      { codeCip: "34009804", nomCommercial: "BIAFINE", dci: "Trolamine", dosage: "186g", forme: "Emulsion", prixReference: 3800, surOrdonnance: false, categorie: "Peau" },
      { codeCip: "34009809", nomCommercial: "ALCOOL 70", dci: "Ethanol", dosage: "250ml", forme: "Solution", prixReference: 1000, surOrdonnance: false, categorie: "Désinfectant" },
      { codeCip: "34009902", nomCommercial: "SERUM PHYSIOLOGIQUE", dci: "Chlorure de sodium", dosage: "5ml", forme: "Dosette", prixReference: 1000, surOrdonnance: false, categorie: "Bébé" },
      { codeCip: "34009903", nomCommercial: "MUSTELA", dci: "Gel lavant", dosage: "500ml", forme: "Gel", prixReference: 6000, surOrdonnance: false, categorie: "Bébé" },
      { codeCip: "34009904", nomCommercial: "BEPANTHEN", dci: "Dexpanthénol", dosage: "5%", forme: "Pommade", prixReference: 3200, surOrdonnance: false, categorie: "Bébé" },
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
