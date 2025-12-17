import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export class CreateDemandeDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom du médicament est obligatoire' })
  medicament: string;

  @IsNumber({}, { message: 'La latitude doit être un nombre' })
  lat: number;

  @IsNumber({}, { message: 'La longitude doit être un nombre' })
  lon: number;

  @IsString()
  @IsOptional()
  modePaiement?: string;

  @IsString()
  @IsOptional()
  pointDeRepere?: string;

  @IsEnum(['STANDARD', 'URGENT'], { message: 'La priorité doit être STANDARD ou URGENT' })
  @IsOptional()
  priorite?: 'STANDARD' | 'URGENT';
}

// DTO pour l'acceptation par le pharmacien
export class AccepterDemandeDto {
  @IsNumber()
  @Min(0, { message: 'Le prix ne peut pas être négatif' })
  prix: number;
}

// DTO pour l'assignation du livreur
export class AssignerLivreurDto {
  @IsString()
  @IsNotEmpty()
  livreurId: string;
}

// DTO pour la mise à jour GPS
export class UpdatePositionDto {
  @IsNumber()
  lat: number;
  
  @IsNumber()
  lon: number;
}
