import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
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

  // 1. Inscription
  async inscription(nom: string, email: string, mdp: string) {
    // Génération du sel et hachage
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(mdp, salt);

    // Création de l'entité
    const user = this.userRepo.create({ 
        nomComplet: nom, 
        email, 
        motDePasse: hash 
    });

    try {
        await this.userRepo.save(user);
        return { message: "Inscription réussie !" };
    } catch (error) {
        // Si le code erreur est lié à une contrainte unique (doublon email)
        // Note: Le code '23505' est spécifique à Postgres, mais ConflictException est générique
        throw new ConflictException('Cet email est déjà utilisé.');
    }
  }

  // 2. Connexion
  async connexion(email: string, mdp: string) {
    const user = await this.userRepo.findOne({ where: { email } });

    // On vérifie le mot de passe crypté
    if (user && (await bcrypt.compare(mdp, user.motDePasse))) {
      // Si c'est bon, on crée le TOKEN (le badge)
      // 'sub' (Subject) est le standard pour l'ID utilisateur dans un JWT
      const payload = { email: user.email, sub: user.id };
      
      return {
        access_token: this.jwtService.sign(payload),
        nom: user.nomComplet // Requis par le front pour afficher "Bonjour X"
      };
    }
    
    // Si email inconnu ou mauvais mot de passe
    throw new UnauthorizedException('Identifiants incorrects');
  }
}
