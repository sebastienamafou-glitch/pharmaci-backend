import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hub } from './hubs.entity';
import { HubsController } from './hubs.controller';
import { HubsService } from './hubs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Hub])],
  controllers: [HubsController],
  providers: [HubsService],
  exports: [HubsService], // ✅ IMPORTANT : On exporte le Service pour l'utiliser dans DemandeService
})
export class HubsModule {}
