import { Controller, Post, Body, Get, Render, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport'; // ✅ Import nécessaire pour la sécurité

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('web/login')
  @Render('login')
  pageLogin() {
    return { title: 'Connexion Pro - PharmaCi' };
  }

  @Get('web/admin')
  @Render('admin') 
  pageAdmin() {
    return { title: 'Administration Ministère' };
  }

  @Post('login')
  async login(@Body() body: any) {
    console.log('👉 Tentative de connexion pour :', body.telephone);

    const user = await this.authService.validateUser(body.telephone, body.password);
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé ou mot de passe incorrect');
      return { status: 401, message: "Numéro ou mot de passe incorrect" };
    }

    const tokenResult = await this.authService.login(user);

    const userRole = user.role ? user.role.trim().toUpperCase() : '';
    console.log('✅ Utilisateur connecté. Rôle :', userRole);

    let redirectUrl: string | null = null;

    switch (userRole) {
        case 'ADMIN':
            redirectUrl = '/auth/web/admin';
            break;
        case 'PHARMACIEN':
            redirectUrl = '/demandes/dashboard';
            break;
        case 'LIVREUR':
            redirectUrl = `/demandes/livreur-dashboard?livreurId=${user.id}`;
            break;
        case 'CLIENT':
            redirectUrl = null; 
            break;
        default:
            console.log('⚠️ Rôle non reconnu :', userRole);
            redirectUrl = '/auth/web/login';
    }

    return {
      access_token: tokenResult.access_token,
      role: userRole,
      nom: user.nomComplet,
      id: user.id,
      redirect_to: redirectUrl 
    };
  }

  @Post('inscription')
  async register(@Body() body: any) {
    return this.authService.inscription(body.nom, body.telephone, body.password, body.role);
  }

  // ✅ CORRECTION SÉCURITÉ :
  // 1. On protège la route avec le Guard JWT (il faut être connecté)
  // 2. On utilise l'ID du token (req.user.userId) pour être sûr que c'est le bon utilisateur
  @UseGuards(AuthGuard('jwt'))
  @Post('subscribe')
  async subscribe(@Request() req) {
    const userId = req.user.userId; // Récupéré automatiquement grâce à jwt.strategy.ts
    console.log("💎 Demande d'abonnement sécurisée pour l'user ID :", userId);
    
    return this.authService.souscrireAbonnement(userId);
  }
}
