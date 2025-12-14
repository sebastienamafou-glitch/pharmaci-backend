import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('inscription')
  async register(@Body() body: any) {
    return this.authService.inscription(body.nom, body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.connexion(body.email, body.password);
  }
}
