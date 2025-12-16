import { Controller, Post, Body, Get, Render, Param, UseGuards, Request, Query } from '@nestjs/common';
import { DemandeService } from './demande.service';
import { AuthGuard } from '@nestjs/passport'; // Assurez-vous d'avoir ce Guard

@Controller('demandes')
export class DemandeController {
  constructor(private readonly service: DemandeService) {}

  // 1. API pour l'app mobile : Créer une demande
  @UseGuards(AuthGuard('jwt')) 
  @Post()
  async nouvelleDemande(@Body() body: any, @Request() req: any) {
    return this.service.creerDemande(
        body.medicament, body.lat, body.lon, body.modePaiement,
        body.pointDeRepere, body.priorite
    );
  }
  
  // 2. API pour lister (JSON)
  @Get()
  async voirTout() {
    return this.service.listerToutes();
  }

  // 3. VUE Dashboard Pharmacien (HTML)
  @Get('dashboard')
  @Render('index') 
  async afficherDashboard() {
    // Récupération des données enrichies depuis le service
    const demandes = await this.service.listerToutes(); 
    
    // Formatage final pour la vue Handlebars
    const demandesFormatees = demandes.map(d => ({
        ...d,
        dateCreation: d.dateCreation?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) || 'N/A',
        isAssurance: d.modePaiement === 'ASSURANCE',
        isUrgent: d.priorite === 'URGENT',
        // On passe explicitement la posologie calculée
        posologie: d.posologie 
    }));
    return { demandes: demandesFormatees };
  }

  // 4. VUE Dashboard Livreur (HTML)
  @Get('livreur-dashboard')
  @Render('livreur') 
  async afficherLivreurDashboard(@Query('livreurId') livreurId: string) {
    const toutesLesDemandes = await this.service.listerToutes();
    
    // Filtre uniquement les commandes prêtes ou en cours
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

  // 5. API détails d'une demande
  @Get(':id')
  async verifierStatut(@Param('id') id: string) {
    return this.service.trouverParId(id);
  }

  // 6. Action : Pharmacien accepte
  @Post(':id/accepter')
  @UseGuards(AuthGuard('jwt')) 
  async accepter(@Param('id') id: string, @Body('prix') prix: number) {
    const prixReelle = parseFloat((prix || 0).toString());
    return this.service.accepterDemande(id, prixReelle);
  }
  
  // 7. Action : Assigner livreur
  @Post(':id/assigner-livreur')
  @UseGuards(AuthGuard('jwt'))
  async assignerLivreur(@Param('id') id: string, @Body('livreurId') livreurId: string) {
    return this.service.assignerLivreurADemande(id, livreurId);
  }

  // 8. Action : Mise à jour GPS livreur
  @Post(':id/update-position')
  async updatePositionLivreur(@Param('id') id: string, @Body('lat') lat: number, @Body('lon') lon: number) {
    return this.service.updateLivreurPosition(id, lat, lon);
  }
}
