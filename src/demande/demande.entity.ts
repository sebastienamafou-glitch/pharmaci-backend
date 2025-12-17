import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Demande {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Numéro court pour l'affichage (ex: #1234)
  @Column({ type: 'int', generated: 'increment' })
  id_short: number;

  // --- INFO MÉDICAMENT ---
  @Column({ nullable: true })
  medicamentId: string; // ✅ Ajouté pour le Service

  @Column()
  medicamentNom: string; // ✅ Renommé/Ajouté pour correspondre au Service

  @Column({ nullable: true })
  codeRetrait: string; // ✅ Ajouté (utilisé pour la sécurité)

  // --- LOCALISATION (Compatible Postgres) ---
  
  // Stockage GeoJSON pour le client ({ type: 'Point', coordinates: [...] })
  @Column({ type: 'jsonb', nullable: true }) 
  positionClient: any; 

  // On garde lat/lon simples au cas où, mais nullable
  @Column({ type: 'float', nullable: true })
  lat: number;

  @Column({ type: 'float', nullable: true })
  lon: number;

  @Column({ nullable: true })
  pointDeRepere: string;

  // --- DETAILS COMMANDE ---
  @Column({ default: 'ESPECES' })
  modePaiement: string; 

  @Column({ default: 'STANDARD' })
  priorite: string; 

  @Column({ default: 'EN_ATTENTE' })
  statut: string; 

  // --- PARTIE FINANCIÈRE (Manquait dans votre fichier) ---
  @Column({ type: 'float', nullable: true })
  prixMedicament: number; // ✅ Ajouté

  @Column({ type: 'float', nullable: true })
  fraisLivraison: number; // ✅ Ajouté

  @Column({ type: 'float', nullable: true })
  totalAPayer: number;    // ✅ Ajouté

  // --- PARTIE PHARMACIE (Manquait) ---
  @Column({ nullable: true })
  pharmacieId: string;    // ✅ Ajouté

  @Column({ nullable: true })
  pharmacieNom: string;   // ✅ Ajouté

  // Position GPS de la pharmacie (Objet JSON)
  @Column({ type: 'jsonb', nullable: true })
  positionPharmacie: { lat: number; lon: number }; // ✅ Ajouté

  // --- PARTIE LIVRAISON ---
  // Position GPS du livreur en temps réel (Objet JSON)
  @Column({ type: 'jsonb', nullable: true })
  positionLivreur: { lat: number; lon: number };   // ✅ Ajouté

  // --- HUB ---
  @Column({ type: 'int', nullable: true })
  hubId: number; 

  @Column({ nullable: true })
  hubNom: string; // ✅ Ajouté

  // --- RELATIONS ---
  @ManyToOne(() => User, { nullable: true })
  client: User;

  @Column({ nullable: true })
  clientId: string;

  @ManyToOne(() => User, { nullable: true })
  livreur: User;

  @Column({ nullable: true })
  livreurId: string;

  @CreateDateColumn()
  dateCreation: Date;
}
 
