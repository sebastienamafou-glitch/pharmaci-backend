import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static'; // ✅ IMPORT
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MeiliSearchModule } from 'nestjs-meilisearch';

// --- MODULES FONCTIONNELS (Tout est propre ici) ---
import { UsersModule } from './users/users.module';
import { PubliciteModule } from './publicite/publicite.module';
import { HubsModule } from './hubs/hubs.module';         
import { MedicamentModule } from './medicament/medicament.module';
import { DemandeModule } from './demande/demande.module';
import { PharmacieModule } from './pharmacie/pharmacie.module'; // ✅ On importe le module

// --- ENTITÉS (Pour que la DB crée les tables) ---
import { Pharmacie } from './pharmacie/pharmacie.entity';
import { Demande } from './demande/demande.entity';
import { User } from './users/user.entity';
import { Publicite } from './publicite/publicite.entity';
import { Hub } from './hubs/hubs.entity';               
import { Medicament } from './medicament/medicament.entity'; 

// --- CONTROLLERS & SERVICES RESTANTS (Juste l'Auth et l'App de base) ---
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { join } from 'path/win32';
import { ConfigModule } from '@nestjs/config'; // ✅ IMPORT

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Dossier "public" à la racine
    }),
    // 1. Base de Données PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL, 
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'pharmaci',
      // ✅ LISTE COMPLÈTE DES ENTITÉS
      entities: [Pharmacie, Demande, User, Publicite, Hub, Medicament],
      synchronize: true, // À false en prod idéale, mais true pour le MVP
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    }),
    
    // 2. Moteur de Recherche (MeiliSearch)
    // ⚠️ Rappel : Si pas de serveur MeiliSearch, l'app plantera ici.
    MeiliSearchModule.forRoot({
      host: process.env.MEILI_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILI_KEY || 'masterKey',
    }),
    
    // 3. Authentification
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SECRET_PHARMACI_KEY', 
      signOptions: { expiresIn: '1d' }, 
    }),

    // 4. Import des Modules
    UsersModule, 
    PubliciteModule,
    HubsModule,      
    MedicamentModule,
    DemandeModule,
    PharmacieModule, // ✅ Ajouté proprement
  ],
  controllers: [
    AppController,
    AuthController
    // ❌ PharmacieController RETIRÉ (car géré par PharmacieModule)
  ],
  providers: [
    AppService,
    AuthService,
    JwtStrategy
    // ❌ PharmacieService RETIRÉ (car géré par PharmacieModule)
  ],
})
export class AppModule {}
