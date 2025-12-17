import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from '../users/user.entity'; // Relation avec les livreurs (Optionnel pour le futur)

@Entity()
export class Hub {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string; // Ex: "Hub Cocody Centre"

  @Column({ type: 'float' })
  lat: number; // Latitude centrale du Hub

  @Column({ type: 'float' })
  lon: number; // Longitude centrale du Hub

  @Column({ type: 'float', default: 5.0 })
  rayonKm: number; // Rayon d'action (ex: 5km autour)

  @Column({ default: true })
  isActive: boolean;
}
