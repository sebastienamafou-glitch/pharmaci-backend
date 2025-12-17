import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publicite } from './publicite.entity';
import { PubliciteController } from './publicite.controller';
import { PubliciteService } from './publicite.service'; // ✅ Import du Service

@Module({
  imports: [TypeOrmModule.forFeature([Publicite])],
  controllers: [PubliciteController],
  providers: [PubliciteService], // ✅ AJOUT OBLIGATOIRE ICI
  exports: [PubliciteService], // (Optionnel : utile si un autre module veut utiliser les pubs)
})
export class PubliciteModule {}
