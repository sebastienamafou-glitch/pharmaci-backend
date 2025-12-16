import { Controller, Post, Get, UseGuards, Request, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  // Route pour s'abonner (Protégée par JWT)
  // POST est correct ici car on crée une souscription (modification d'état)
  @UseGuards(AuthGuard('jwt'))
  @Post('subscribe')
  async sAbonner(@Request() req: any, @Body('dureeMois') dureeMois: number = 1) {
    // 1. Récupérer l'utilisateur connecté via le token
    const userId = req.user.userId;
    const user = await this.usersRepo.findOne({ where: { id: userId } });

    if (!user) return { success: false, message: "Utilisateur introuvable" };

    // 2. Calculer la date de fin (Date actuelle + X mois)
    const dateFin = new Date();
    // On force la conversion en Nombre pour éviter les erreurs de type
    dateFin.setMonth(dateFin.getMonth() + Number(dureeMois));

    // 3. Mettre à jour le statut
    user.abonnementType = 'PREMIUM';
    user.finAbonnement = dateFin;

    await this.usersRepo.save(user);

    return { 
      success: true, 
      message: `Abonnement Santé+ activé jusqu'au ${dateFin.toLocaleDateString()}`,
      user: {
          role: user.role,
          abonnement: user.abonnementType,
          fin: user.finAbonnement
      }
    };
  }
  
  // Route pour vérifier son profil
  // ✅ CORRECTION : Utilisation de GET pour la lecture de données
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req: any) {
      const user = await this.usersRepo.findOne({ where: { id: req.user.userId } });
      
      if (!user) return { message: "Utilisateur non trouvé" };

      // On cache le mot de passe avant de renvoyer les infos
      const { motDePasse, ...result } = user;
      return result;
  }
}
