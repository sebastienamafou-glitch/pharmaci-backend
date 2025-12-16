import { Module, forwardRef } from '@nestjs/common';
import { MedicamentController } from './medicament.controller';
import { MedicamentService } from './medicament.service';
import { MeiliSearchModule } from 'nestjs-meilisearch';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicament } from './medicament.entity';
import { DemandeModule } from '../demande/demande.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medicament]), 

    // CORRECTION ICI : On retire les crochets [] qui entouraient l'objet
    MeiliSearchModule.forRoot({
      host: process.env.MEILI_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILI_KEY || 'masterKey',
    }),
    
    forwardRef(() => DemandeModule), 
  ],
  controllers: [MedicamentController],
  providers: [MedicamentService],
  exports: [MedicamentService], 
})
export class MedicamentModule {}
