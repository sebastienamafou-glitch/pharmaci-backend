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
    const user = await this.authService.validateUser(body.telephone, body.password);
    
    if (!user) {
      return { status: 401, message: "Numéro ou mot de passe incorrect" };
    }

    const tokenResult = await this.authService.login(user);

    // ✅ CORRECTION : On précise le type (string | null)
    let redirectUrl: string | null = null;

    switch (user.role) {
        case 'ADMIN':
            redirectUrl = '/auth/web/admin';
            break;
        case 'PHARMACIEN':
            redirectUrl = '/demandes/dashboard';
            break;
        case 'LIVREUR':
            // Redirection vers le dashboard livreur
            redirectUrl = `/demandes/livreur-dashboard?livreurId=${user.id}`;
            break;
        case 'CLIENT':
            redirectUrl = null; 
            break;
        default:
            redirectUrl = '/auth/web/login';
    }

    return {
      access_token: tokenResult.access_token,
      role: user.role,
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
