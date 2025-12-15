import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Medicament {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) 
  codeCip: string; // Code unique (ex: code barre ou CIP)

  @Column() 
  nomCommercial: string; // ex: "DOLIPRANE"

  @Column()
  dci: string; // Dénomination Commune Internationale (ex: "Paracétamol")

  @Column()
  dosage: string; // ex: "1000 mg"

  @Column()
  forme: string; // ex: "Comprimé", "Sirop", "Injectable"

  @Column({ type: 'float', nullable: true })
  prixReference: number; // Prix indicatif en FCFA

  @Column({ default: false })
  surOrdonnance: boolean; // true si ordonnance obligatoire
}
