import { Controller, Post, Body, Get, Render } from '@nestjs/common';
import { AuthService } from './auth.service';

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
    console.log('👉 Tentative de connexion pour :', body.telephone); // LOG 1

    const user = await this.authService.validateUser(body.telephone, body.password);
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé ou mot de passe incorrect'); // LOG 2
      return { status: 401, message: "Numéro ou mot de passe incorrect" };
    }

    const tokenResult = await this.authService.login(user);

    // 🛡️ SÉCURITÉ : On nettoie le rôle (enlève les espaces et met en majuscules)
    const userRole = user.role ? user.role.trim().toUpperCase() : '';
    
    console.log('✅ Utilisateur connecté. Rôle brut:', user.role, 'Rôle nettoyé:', userRole); // LOG 3

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
            console.log('⚠️ Rôle non reconnu dans le switch:', userRole); // LOG 4
            redirectUrl = '/auth/web/login';
    }

    console.log('🔄 Redirection calculée :', redirectUrl); // LOG 5

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
}
