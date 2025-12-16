import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Publicite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titre: string; // Ex: "Promo Doliprane"

  @Column()
  imageUrl: string; // URL de l'image (hébergée sur le web)

  @Column({ nullable: true })
  lienRedirection: string; // URL à ouvrir au clic (facultatif)

  @Column({ default: true })
  isActive: boolean; // Pour activer/désactiver sans supprimer

  @Column({ type: 'int', default: 1 })
  ordre: number; // Pour choisir quelle pub s'affiche en premier

  @CreateDateColumn()
  dateCreation: Date;
}
