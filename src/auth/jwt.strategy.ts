import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SECRET_PHARMACI_KEY', 
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    // ✅ CORRECTION : On renvoie aussi isPremium pour qu'il soit accessible via req.user
    return { 
      userId: payload.sub, 
      telephone: payload.telephone, 
      role: payload.role,
      isPremium: payload.isPremium 
    };
  }
}
