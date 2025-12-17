import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Pharmacie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ default: false })
  estDeGarde: boolean; // Utile pour filtrer les pharmacies de nuit

  // 📍 Géolocalisation PostGIS
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326, // Standard GPS
  })
  position: any; 
}
