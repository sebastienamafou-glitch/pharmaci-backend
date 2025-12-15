import { Injectable } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import { InjectMeiliSearch } from 'nestjs-meilisearch'; // 👈 IMPORTANT : Nouvel import

@Injectable()
export class MedicamentService {
  // On ne crée plus le client manuellement avec "new MeiliSearch"
  // On demande à NestJS de nous donner celui configuré dans app.module.ts
  constructor(
    @InjectMeiliSearch() private readonly client: MeiliSearch
  ) {}

  async chargerDonneesInitiales() {
    const index = this.client.index('medicaments');

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

  async rechercher(query: string) {
    const index = this.client.index('medicaments');
    return await index.search(query, {
        limit: 10,
    });
  }
}
