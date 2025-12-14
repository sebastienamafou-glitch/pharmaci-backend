import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Entités
import { Pharmacie } from './pharmacie/pharmacie.entity';
import { Demande } from './demande/demande.entity';
import { User } from './users/user.entity';

// Controllers & Services
import { PharmacieController } from './pharmacie/pharmacie.controller';
import { PharmacieService } from './pharmacie/pharmacie.service';
import { MedicamentController } from './medicament/medicament.controller';
import { MedicamentService } from './medicament/medicament.service';
import { DemandeController } from './demande/demande.controller';
import { DemandeService } from './demande/demande.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // ✅ CORRECTION CRITIQUE : Utilisation de l'URL pour la production (Neon)
      // Si process.env.DATABASE_URL est défini (par Render), on l'utilise.
      // Sinon, on revient à la configuration localhost pour le développement.
      url: process.env.DATABASE_URL,
      
      // Si l'URL n'est pas définie (mode dev local), on utilise les détails ci-dessous.
      // TypeORM utilise soit 'url' soit 'host'/'port'.
      host: process.env.DATABASE_URL ? undefined : 'localhost',
      port: process.env.DATABASE_URL ? undefined : 5432,
      username: process.env.DATABASE_URL ? undefined : 'pharmaci_admin',
      password: process.env.DATABASE_URL ? undefined : 'pharmaci_password',
      database: process.env.DATABASE_URL ? undefined : 'pharmaci_db',
      
      type: 'postgres',
      entities: [Pharmacie, Demande, User],
      synchronize: true,

      // ⚠️ IMPORTANT pour Neon/Render : Activer le SSL pour la connexion distante
      ssl: process.env.DATABASE_URL ? {
        rejectUnauthorized: false,
      } : false,
    }),
    TypeOrmModule.forFeature([Pharmacie, Demande, User]),
    
    // Configuration de la sécurité JWT
    PassportModule,
    JwtModule.register({
      // ✅ SÉCURITÉ : Utiliser une variable d'environnement pour le secret JWT
      secret: process.env.JWT_SECRET || 'SECRET_PHARMACI_KEY', 
      signOptions: { expiresIn: '1d' }, 
    }),
  ],
  controllers: [
    PharmacieController, 
    MedicamentController, 
    DemandeController, 
    AuthController
  ],
  providers: [
    PharmacieService, 
    MedicamentService, 
    DemandeService, 
    AuthService,
    JwtStrategy
  ],
})
export class AppModule {}
