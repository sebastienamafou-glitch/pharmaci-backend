import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string; 

  @Column({ unique: true })
  telephone: string;

  @Column()
  motDePasse: string;

  @Column({ default: 'CLIENT' })
  role: string; 

  @Column()
  nomComplet: string;

  @Column({ default: 'STANDARD' }) // 'STANDARD' ou 'PREMIUM'
  abonnementType: string;

  @Column({ type: 'timestamp', nullable: true })
  finAbonnement: Date;

  @Column({ default: false })
  isPremium: boolean;

  @CreateDateColumn()
  dateInscription: Date;
}
