import { Injectable } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';

@Injectable()
export class MedicamentService {
  private client: MeiliSearch;

  constructor() {
    // Connexion au serveur Meilisearch qu'on vient de lancer
    this.client = new MeiliSearch({
      host: 'http://localhost:7700',
      apiKey: 'pharmaMasterKey123', // La clé définie à l'étape 1
    });
  }

  // Fonction pour charger des faux médicaments (Seed)
  async chargerDonneesInitiales() {
    const index = this.client.index('medicaments');

    // Une liste fictive pour tester le MVP
    const medicaments = [
      { id: 1, nom: 'Doliprane 1000mg', description: 'Paracétamol, fièvre et douleurs', forme: 'Comprimé' },
      { id: 2, nom: 'Doliprane 500mg', description: 'Paracétamol enfant', forme: 'Gélule' },
      { id: 3, nom: 'Efferalgan', description: 'Paracétamol effervescent', forme: 'Comprimé' },
      { id: 4, nom: 'Smecta', description: 'Troubles digestifs, diarrhée', forme: 'Poudre' },
      { id: 5, nom: 'Spasfon', description: 'Douleurs abdominales', forme: 'Comprimé' },
      { id: 6, nom: 'Fervex', description: 'État grippal', forme: 'Sachet' },
      { id: 7, nom: 'Vogalib', description: 'Nausées et vomissements', forme: 'Lyophilisat' },
    ];

    console.log('Envoi des données à Meilisearch...');
    return await index.addDocuments(medicaments);
  }

  // La recherche intelligente
  async rechercher(query: string) {
    const index = this.client.index('medicaments');
    // search permet la tolérance aux fautes de frappe par défaut
    return await index.search(query, {
        limit: 10, // On limite à 10 résultats
    });
  }
}
