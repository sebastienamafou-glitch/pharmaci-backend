import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Pharmacie {
  @PrimaryGeneratedColumn('uuid') // On utilise des ID uniques (UUID) c'est plus pro
  id: string;

  @Column()
  nom: string;

  @Column({ nullable: true })
  adresse: string;

  @Column({ default: false })
  estDeGarde: boolean; // Pour savoir si elle est ouverte la nuit

  // C'est ici le secret de PostGIS : on stocke un point GPS
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326, // Le standard GPS mondial
    nullable: true,
  })
  position: any; // Contiendra { type: 'Point', coordinates: [lon, lat] }
}
