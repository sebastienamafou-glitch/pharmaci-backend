import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pharmacie } from './pharmacie.entity';
import { PharmacieService } from './pharmacie.service';
import { PharmacieController } from './pharmacie.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pharmacie])], // Active l'entité
  controllers: [PharmacieController],
  providers: [PharmacieService],
  exports: [PharmacieService], // Utile si le module Demande en a besoin un jour
})
export class PharmacieModule {}
