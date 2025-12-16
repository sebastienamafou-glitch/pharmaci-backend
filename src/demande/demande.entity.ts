import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Demande {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ✅ INDISPENSABLE pour lier à MeiliSearch
  @Column({ nullable: true })
  medicamentId: string; 
  
  @Column()
  medicamentNom: string;

  @Column({ default: 'EN_ATTENTE' })
  statut: string; 

  @Column({ default: 'ESPECES' })
  modePaiement: string;

  @Column({ nullable: true })
  codeRetrait: string;

  @Column({ nullable: true })
  pharmacieId: string;

  @Column({ nullable: true })
  pharmacieNom: string;

  @Column({ type: 'simple-json', nullable: true })
  positionPharmacie: { lat: number; lon: number };

  // ✅ INDISPENSABLE pour le suivi GPS Livreur
  @Column({ type: 'simple-json', nullable: true })
  positionLivreur: { lat: number; lon: number };

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  positionClient: any; 

  @CreateDateColumn()
  dateCreation: Date;
}
