import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MeiliSearchModule } from 'nestjs-meilisearch';
import { UsersModule } from './users/users.module'; // ✅ 1. Import correct

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
      url: process.env.DATABASE_URL,
      
      // Configuration fallback (local)
      host: process.env.DATABASE_URL ? undefined : 'localhost',
      port: process.env.DATABASE_URL ? undefined : 5432,
      username: process.env.DATABASE_URL ? undefined : 'pharmaci_admin',
      password: process.env.DATABASE_URL ? undefined : 'pharmaci_password',
      database: process.env.DATABASE_URL ? undefined : 'pharmaci_db',
      
      type: 'postgres',
      entities: [Pharmacie, Demande, User],
      synchronize: true, // À mettre à false en vraie prod pour utiliser les migrations
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    }),
    
    TypeOrmModule.forFeature([Pharmacie, Demande, User]),
    
    MeiliSearchModule.forRoot({
      host: process.env.MEILI_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILI_KEY || 'masterKey',
    }),
    
    PassportModule,
    
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SECRET_PHARMACI_KEY', 
      signOptions: { expiresIn: '1d' }, 
    }),

    // ✅ 2. CORRECTION : UsersModule est ici (dans imports)
    UsersModule, 
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
    // ❌ UsersModule RETIRÉ d'ici (ce n'est pas un provider)
  ],
})
export class AppModule {}
