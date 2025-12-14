import { Controller, Post, Body, Get, Render } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 🌍 Page de connexion Web (Commune Admin/Pharma)
  @Get('web/login')
  @Render('login')
  pageLogin() {
    return { title: 'Connexion Pro' };
  }

  // 👑 NOUVEAU : Page SuperAdmin (Ministère)
  @Get('web/admin')
  @Render('admin') // Charge views/admin.hbs
  pageAdmin() {
    return { title: 'Administration Ministère' };
  }

  // 🚀 Login
  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.telephone, body.password);
    
    if (!user) {
      return { status: 401, message: "Numéro ou mot de passe incorrect" };
    }

    const tokenResult = await this.authService.login(user);

    return {
      access_token: tokenResult.access_token,
      role: user.role,
      nom: user.nomComplet,
      id: user.id
    };
  }

  // 📝 Inscription (Client par défaut, mais permet Pharmacien si spécifié)
  @Post('inscription')
  async register(@Body() body: any) {
    // Si 'body.role' est envoyé (par le dashboard admin), on l'utilise
    // Sinon, par défaut c'est 'CLIENT' (voir auth.service.ts)
    return this.authService.inscription(body.nom, body.telephone, body.password, body.role);
  }
}
