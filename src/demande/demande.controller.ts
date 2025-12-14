import { Controller, Post, Body, Get, Render, Param, UseGuards, Request } from '@nestjs/common';
import { DemandeService } from './demande.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('demandes')
export class DemandeController {
  constructor(private readonly service: DemandeService) {}

  @UseGuards(AuthGuard('jwt')) 
  @Post()
  async nouvelleDemande(@Body() body: any, @Request() req: any) {
    if (req.user) {
        console.log(`👤 Utilisateur connecté ID : ${req.user.userId}`);
    }
    // ✅ MISE A JOUR : On passe aussi le modePaiement
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
        dateCreation: d.dateCreation.toLocaleTimeString('fr-FR'),
        // Petite astuce visuelle pour le dashboard
        isAssurance: d.modePaiement === 'ASSURANCE'
    }));
    return { demandes: demandesFormatees };
  }

  @Get(':id')
  async verifierStatut(@Param('id') id: string) {
    const demande = await this.service.trouverParId(id);
    return demande; 
  }

  @Post(':id/accepter')
  async accepter(@Param('id') id: string) {
    console.log(`✅ La demande ${id} a été acceptée par une pharmacie.`);
    return this.service.accepterDemande(id);
  }
}
