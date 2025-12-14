import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  motDePasse: string; // Ce sera stocké crypté

  @Column()
  nomComplet: string;

  @CreateDateColumn()
  dateInscription: Date;
}
