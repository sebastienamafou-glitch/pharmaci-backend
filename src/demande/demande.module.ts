import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandeService } from './demande.service';
import { DemandeController } from './demande.controller';
import { Demande } from './demande.entity';
import { AuthModule } from '../auth/auth.module'; // Nécessaire pour les Guards JWT
import { MedicamentModule } from '../medicament/medicament.module'; // Import du module Medicament
import { HubsModule } from '../hubs/hubs.module'; // ✅ 1. IMPORT DU MODULE HUB

@Module({
  imports: [
    TypeOrmModule.forFeature([Demande]), 
    forwardRef(() => AuthModule), 
    forwardRef(() => MedicamentModule), 
    HubsModule,
  ],
  controllers: [DemandeController],
  providers: [DemandeService],
  exports: [DemandeService], // Permet à d'autres modules (Livreur) d'utiliser DemandeService
})
export class DemandeModule {}
