import { Module, forwardRef } from '@nestjs/common';
import { MedicamentController } from './medicament.controller';
import { MedicamentService } from './medicament.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicament } from './medicament.entity';
import { DemandeModule } from '../demande/demande.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medicament]), 
    // ✅ CORRECTION : Pas de MeiliSearchModule.forRoot() ici !
    // La connexion est gérée uniquement dans app.module.ts
    
    forwardRef(() => DemandeModule), 
  ],
  controllers: [MedicamentController],
  providers: [MedicamentService],
  exports: [MedicamentService], 
})
export class MedicamentModule {}
