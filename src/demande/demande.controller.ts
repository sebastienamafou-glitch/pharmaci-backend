import { Controller, Post, Body, Get, Render, Param, UseGuards, Request, Query } from '@nestjs/common';
import { DemandeService } from './demande.service';
import { AuthGuard } from '@nestjs/passport'; 
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// ✅ IMPORTS DTO
import { CreateDemandeDto, AccepterDemandeDto, AssignerLivreurDto, UpdatePositionDto } from './dto/create-demande.dto';

@Controller('demandes')
export class DemandeController {
  constructor(private readonly service: DemandeService) {}

  // ==========================================================
  // 📱 CLIENT : CRÉER UNE DEMANDE (Validée par DTO)
  // ==========================================================
  @UseGuards(AuthGuard('jwt')) 
  @Post()
  async nouvelleDemande(@Body() dto: CreateDemandeDto, @Request() req: any) { // ✅ Utilisation du DTO
    return this.service.creerDemande(
        dto.medicament, 
        dto.lat, 
        dto.lon, 
        dto.modePaiement,
        dto.pointDeRepere, 
        dto.priorite
    );
  }
  
  // ==========================================================
  // 💊 PHARMACIEN : VOIR TOUTES LES DEMANDES
  // ==========================================================
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('PHARMACIEN', 'ADMIN')
  async voirTout() {
    return this.service.listerToutes();
  }

  // ==========================================================
  // 💊 PHARMACIEN : DASHBOARD WEB
  // ==========================================================
  @Get('dashboard')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('PHARMACIEN', 'ADMIN')
  @Render('index') 
  async afficherDashboard() {
    const demandes = await this.service.listerToutes(); 
    
    const demandesFormatees = demandes.map(d => ({
        ...d,
        dateCreation: d.dateCreation?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) || 'N/A',
        isAssurance: d.modePaiement === 'ASSURANCE',
        isUrgent: d.priorite === 'URGENT',
        posologie: d.posologie 
    }));
    return { demandes: demandesFormatees };
  }

  // ==========================================================
  // 🛵 LIVREUR : DASHBOARD WEB
  // ==========================================================
  @Get('livreur-dashboard')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('LIVREUR', 'ADMIN')
  @Render('livreur') 
  async afficherLivreurDashboard(@Query('livreurId') livreurId: string) {
    const toutesLesDemandes = await this.service.listerToutes();
    
    const demandesLivreur = toutesLesDemandes.filter(d => 
        d.statut === 'ACCEPTEE' || d.statut === 'LIVRAISON_EN_COURS'
    ).map(d => ({
        ...d,
        id_short: d.id.substring(0, 8),
        dateCreation: d.dateCreation?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) || 'N/A',
        pointDeRepere: d.pointDeRepere || 'Aucun point de repère'
    }));
    return { demandes: demandesLivreur };
  }

  // ==========================================================
  // ℹ️ DÉTAILS D'UNE DEMANDE
  // ==========================================================
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async verifierStatut(@Param('id') id: string) {
    return this.service.trouverParId(id);
  }

  // ==========================================================
  // 🚨 PHARMACIEN : ACCEPTER LA DEMANDE (Validé par DTO)
  // ==========================================================
  @Post(':id/accepter')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('PHARMACIEN')
  async accepter(@Param('id') id: string, @Body() dto: AccepterDemandeDto) { // ✅ Validation du prix
    return this.service.accepterDemande(id, dto.prix);
  }
  
  // ==========================================================
  // 🚨 PHARMACIEN : ASSIGNER UN LIVREUR (Validé par DTO)
  // ==========================================================
  @Post(':id/assigner-livreur')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('PHARMACIEN')
  async assignerLivreur(@Param('id') id: string, @Body() dto: AssignerLivreurDto) { // ✅ Validation ID Livreur
    return this.service.assignerLivreurADemande(id, dto.livreurId);
  }

  // ==========================================================
  // 📍 LIVREUR : MISE À JOUR GPS (Validé par DTO)
  // ==========================================================
  @Post(':id/update-position')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('LIVREUR')
  async updatePositionLivreur(@Param('id') id: string, @Body() dto: UpdatePositionDto) { // ✅ Validation Coordonnées
    return this.service.updateLivreurPosition(id, dto.lat, dto.lon);
  }
}
