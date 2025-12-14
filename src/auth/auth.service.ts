import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // ✅ 1. Validation via Téléphone (Utilisé par le Controller)
  async validateUser(telephone: string, pass: string): Promise<any> {
    const user = await this.userRepo.findOne({ where: { telephone } });
    
    // Si l'utilisateur existe et que le mot de passe correspond
    if (user && await bcrypt.compare(pass, user.motDePasse)) {
      const { motDePasse, ...result } = user;
      return result;
    }
    return null;
  }

  // ✅ 2. Génération du Token (Payload avec Téléphone)
  async login(user: any) {
    const payload = { telephone: user.telephone, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // ✅ 3. Inscription via Téléphone
  async inscription(nom: string, telephone: string, pass: string, role: string = 'CLIENT') {
    // Vérification si le numéro existe déjà
    const exist = await this.userRepo.findOne({ where: { telephone } });
    if (exist) {
      throw new ConflictException('Ce numéro de téléphone est déjà utilisé.');
    }

    // Hachage du mot de passe
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(pass, salt);

    const newUser = this.userRepo.create({
      nomComplet: nom,
      telephone: telephone, // Stockage du numéro
      motDePasse: hash,
      role: role
    });

    try {
      await this.userRepo.save(newUser);
      return { status: 201, message: "Inscription réussie !" };
    } catch (error) {
      throw new ConflictException('Erreur lors de l\'inscription.');
    }
  }
}
