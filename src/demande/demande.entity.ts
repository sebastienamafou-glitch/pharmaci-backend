import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Demande {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Numéro court pour l'affichage (ex: #1234)
  @Column({ type: 'int', generated: 'increment' })
  id_short: number;

  @Column()
  medicament: string; // Nom du médicament

  // --- LOCALISATION ---
  @Column({ type: 'float' })
  lat: number;

  @Column({ type: 'float' })
  lon: number;

  @Column({ nullable: true })
  pointDeRepere: string; // Ex: "Portail vert"

  // --- DETAILS COMMANDE ---
  @Column({ default: 'ESPECES' })
  modePaiement: string; // ESPECES, WAVE, OM...

  @Column({ default: 'STANDARD' })
  priorite: string; // STANDARD, URGENT

  @Column({ default: 'EN_ATTENTE' })
  statut: string; // EN_ATTENTE, ACCEPTEE, EN_COURS, TERMINEE

  // --- RELATIONS ---
  
  // Le Client qui a commandé (Optionnel si commande anonyme, mais recommandé)
  @ManyToOne(() => User, { nullable: true })
  client: User;

  @Column({ nullable: true })
  clientId: string;

  // Le Livreur assigné
  @ManyToOne(() => User, { nullable: true })
  livreur: User;

  @Column({ nullable: true })
  livreurId: string;

  // ✅ CORRECTION DE L'ERREUR ICI
  // On définit explicitement que hubId est un nombre (ou null)
  @Column({ type: 'int', nullable: true })
  hubId: number; 

  @CreateDateColumn()
  dateCreation: Date;
}
