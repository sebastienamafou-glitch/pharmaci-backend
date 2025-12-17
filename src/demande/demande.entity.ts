import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Demande {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ✅ CORRECTION : Ajout de "| null" pour autoriser la valeur null
  @Column({ nullable: true })
  hubId: string | null;

  @Column({ nullable: true })
  hubNom: string | null;

  @Column({ nullable: true })
  medicamentId: string | null; 
  
  @Column()
  medicamentNom: string;

  @Column({ default: 'EN_ATTENTE' })
  statut: string; 

  @Column({ default: 'ESPECES' })
  modePaiement: string;

  @Column({ default: 'STANDARD' })
  priorite: 'STANDARD' | 'URGENT';

  @Column({ nullable: true })
  pointDeRepere: string | null;

  // --- 💰 SECTION FINANCIÈRE ---
  @Column({ type: 'float', nullable: true })
  prixMedicament: number | null; 

  @Column({ type: 'float', default: 1500 })
  fraisLivraison: number; 

  @Column({ type: 'float', nullable: true })
  totalAPayer: number | null; 
  // -----------------------------

  @Column({ nullable: true })
  codeRetrait: string | null;

  @Column({ nullable: true })
  pharmacieId: string | null;

  @Column({ nullable: true })
  pharmacieNom: string | null;

  @Column({ type: 'simple-json', nullable: true })
  positionPharmacie: { lat: number; lon: number } | null;

  @Column({ type: 'simple-json', nullable: true })
  positionLivreur: { lat: number; lon: number } | null;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  positionClient: any; 

  @CreateDateColumn()
  dateCreation: Date;
}
