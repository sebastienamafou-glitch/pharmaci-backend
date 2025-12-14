import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string; // ou userId selon votre convention précédente

  // ✅ CHANGEMENT : Identifiant unique par téléphone
  @Column({ unique: true })
  telephone: string;

  @Column()
  motDePasse: string;

  @Column({ default: 'CLIENT' })
  role: string; // 'CLIENT', 'PHARMACIEN', 'ADMIN'

  @Column()
  nomComplet: string;

  @CreateDateColumn()
  dateInscription: Date;
}
