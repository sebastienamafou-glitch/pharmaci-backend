import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SECRET_PHARMACI_KEY', // Doit matcher auth.module.ts
    });
  }

  async validate(payload: any) {
    // Si le token est valide (signature OK), cette fonction est appelée.
    if (!payload) {
      throw new UnauthorizedException();
    }
    // On renvoie l'objet qui sera injecté dans 'req.user'
    return { userId: payload.sub, telephone: payload.telephone, role: payload.role };
  }
}
