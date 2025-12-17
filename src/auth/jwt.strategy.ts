import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // 🔒 SÉCURITÉ CRITIQUE : Vérification stricte de la variable d'environnement
    const secretKey = process.env.JWT_SECRET;

    if (!secretKey) {
      throw new Error('❌ FATAL ERROR: La variable JWT_SECRET est manquante. L\'application ne peut pas démarrer de manière sécurisée.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey, // ✅ Plus de fallback 'en dur' ici
    });
  }

  async validate(payload: any) {
    // Cette méthode est appelée si le token est valide
    return { 
      userId: payload.sub, 
      username: payload.username, 
      role: payload.role // On s'assure de bien récupérer le rôle pour les Guards
    };
  }
}
