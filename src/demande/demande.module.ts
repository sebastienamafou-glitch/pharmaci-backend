import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandeService } from './demande.service';
import { DemandeController } from './demande.controller';
import { Demande } from './demande.entity';
import { AuthModule } from '../auth/auth.module'; // Nécessaire pour les Guards JWT
import { MedicamentModule } from '../medicament/medicament.module'; // Import du module Medicament

@Module({
  imports: [
    // 1. Module TypeORM pour la connexion DB (Repository<Demande>)
    TypeOrmModule.forFeature([Demande]), 

    // 2. Module d'Authentification (pour AuthGuard('jwt'))
    forwardRef(() => AuthModule), 

    // 3. Module des Médicaments (pour injecter MedicamentService)
    // ⚠️ On utilise forwardRef ici car MedicamentModule dépend maintenant de DemandeModule
    forwardRef(() => MedicamentModule), 
  ],
  controllers: [DemandeController],
  providers: [DemandeService],
  exports: [DemandeService], // Permet à d'autres modules (Livreur) d'utiliser DemandeService
})
export class DemandeModule {}
