import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Demande {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  medicamentNom: string;

  @Column({ default: 'EN_ATTENTE' })
  statut: string; 

  // Mode de paiement (ESPECES, ASSURANCE, MOBILE_MONEY)
  @Column({ default: 'ESPECES' })
  modePaiement: string;

  // ✅ NOUVEAU : Le Code de Retrait Sécurisé (ex: 8943)
  // C'est ce code que le coursier devra donner au pharmacien
  @Column({ nullable: true })
  codeRetrait: string;

  @Column({ nullable: true })
  pharmacieId: string;

  @Column({ nullable: true })
  pharmacieNom: string;

  @Column({ type: 'simple-json', nullable: true })
  positionPharmacie: { lat: number; lon: number };

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  positionClient: any; 

  @CreateDateColumn()
  dateCreation: Date;
}
