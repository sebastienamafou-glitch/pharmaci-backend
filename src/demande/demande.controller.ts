import { Controller, Post, Body, Get, Render, Param, UseGuards, Request, Query } from '@nestjs/common';
import { DemandeService } from './demande.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('demandes')
export class DemandeController {
  constructor(private readonly service: DemandeService) {}

  @UseGuards(AuthGuard('jwt')) 
  @Post()
  async nouvelleDemande(@Body() body: any, @Request() req: any) {
    // ✅ INTEGRATION : Réception des champs Pro (Point de repère & Priorité)
    // Si l'app mobile n'envoie pas encore ces champs, les valeurs par défaut du service ('', 'STANDARD') seront utilisées.
    return this.service.creerDemande(
        body.medicament, 
        body.lat, 
        body.lon, 
        body.modePaiement,
        body.pointDeRepere, // Nouveau champ
        body.priorite       // Nouveau champ ('URGENT' | 'STANDARD')
    );
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
        isAssurance: d.modePaiement === 'ASSURANCE',
        // ✅ VISUEL : On passe l'info au template HBS
        isUrgent: d.priorite === 'URGENT'
    }));
    return { demandes: demandesFormatees };
  }

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
        // Le livreur doit voir le point de repère
        pointDeRepere: d.pointDeRepere || 'Aucun point de repère'
    }));
    return { demandes: demandesLivreur };
  }

  @Get(':id')
  async verifierStatut(@Param('id') id: string) {
    return this.service.trouverParId(id);
  }

  // ✅ MISE A JOUR : On attend le body { prix: 12500 } venant du Dashboard
  @Post(':id/accepter')
  @UseGuards(AuthGuard('jwt')) 
  async accepter(@Param('id') id: string, @Body('prix') prix: number) {
    // Conversion simple pour sécuriser le type (au cas où string est envoyé)
    const prixReelle = parseFloat((prix || 0).toString());
    return this.service.accepterDemande(id, prixReelle);
  }
  
  @Post(':id/assigner-livreur')
  @UseGuards(AuthGuard('jwt'))
  async assignerLivreur(@Param('id') id: string, @Body('livreurId') livreurId: string) {
    return this.service.assignerLivreurADemande(id, livreurId);
  }

  @Post(':id/update-position')
  async updatePositionLivreur(@Param('id') id: string, @Body('lat') lat: number, @Body('lon') lon: number) {
    return this.service.updateLivreurPosition(id, lat, lon);
  }
}
