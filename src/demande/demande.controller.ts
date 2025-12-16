import { Controller, Post, Body, Get, Render, Param, UseGuards, Request, Query } from '@nestjs/common';
import { DemandeService } from './demande.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('demandes')
export class DemandeController {
  constructor(private readonly service: DemandeService) {}

  @UseGuards(AuthGuard('jwt')) 
  @Post()
  async nouvelleDemande(@Body() body: any, @Request() req: any) {
    return this.service.creerDemande(body.medicament, body.lat, body.lon, body.modePaiement);
  }
  
  @Get()
  async voirTout() {
    return this.service.listerToutes();
  }

  @Get('dashboard')
  @Render('index') 
  async afficherDashboard() {
    const demandes = await this.service.listerToutes(); 
    const demandesFormatees = demandes.map(d => ({
        ...d,
        dateCreation: d.dateCreation?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) || 'N/A',
        isAssurance: d.modePaiement === 'ASSURANCE'
    }));
    return { demandes: demandesFormatees };
  }

  // ✅ ROUTE LIVREUR DASHBOARD
  @Get('livreur-dashboard')
  @Render('livreur') 
  async afficherLivreurDashboard(@Query('livreurId') livreurId: string) {
    const toutesLesDemandes = await this.service.listerToutes();
    const demandesLivreur = toutesLesDemandes.filter(d => 
        d.statut === 'ACCEPTEE' || d.statut === 'LIVRAISON_EN_COURS'
    ).map(d => ({
        ...d,
        id_short: d.id.substring(0, 8),
        dateCreation: d.dateCreation?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) || 'N/A',
    }));
    return { demandes: demandesLivreur };
  }

  @Get(':id')
  async verifierStatut(@Param('id') id: string) {
    return this.service.trouverParId(id);
  }

  @Post(':id/accepter')
  @UseGuards(AuthGuard('jwt')) 
  async accepter(@Param('id') id: string) {
    return this.service.accepterDemande(id);
  }
  
  // ✅ ROUTE ASSIGNATION LIVREUR
  @Post(':id/assigner-livreur')
  @UseGuards(AuthGuard('jwt'))
  async assignerLivreur(@Param('id') id: string, @Body('livreurId') livreurId: string) {
    return this.service.assignerLivreurADemande(id, livreurId);
  }

  // ✅ ROUTE MISE A JOUR GPS
  @Post(':id/update-position')
  async updatePositionLivreur(@Param('id') id: string, @Body('lat') lat: number, @Body('lon') lon: number) {
    return this.service.updateLivreurPosition(id, lat, lon);
  }
}
