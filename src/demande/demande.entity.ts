import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Demande {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  medicamentId: string; 
  
  @Column()
  medicamentNom: string;

  @Column({ default: 'EN_ATTENTE' })
  statut: string; 

  @Column({ default: 'ESPECES' })
  modePaiement: string;

  @Column({ default: 'STANDARD' })
  priorite: 'STANDARD' | 'URGENT';

  @Column({ nullable: true })
  pointDeRepere: string;

  // --- 💰 SECTION FINANCIÈRE (Nouveau) ---
  @Column({ type: 'float', nullable: true })
  prixMedicament: number; // Saisi par le pharmacien

  @Column({ type: 'float', default: 1500 })
  fraisLivraison: number; // Calculé par le système

  @Column({ type: 'float', nullable: true })
  totalAPayer: number; // Somme des deux
  // ----------------------------------------

  @Column({ nullable: true })
  codeRetrait: string;

  @Column({ nullable: true })
  pharmacieId: string;

  @Column({ nullable: true })
  pharmacieNom: string;

  @Column({ type: 'simple-json', nullable: true })
  positionPharmacie: { lat: number; lon: number };

  @Column({ type: 'simple-json', nullable: true })
  positionLivreur: { lat: number; lon: number };

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  positionClient: any; 

  @CreateDateColumn()
  dateCreation: Date;
}
