import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MeiliSearchModule } from 'nestjs-meilisearch';
import { ConfigModule } from '@nestjs/config'; // ✅ IMPORT CORRECT

// --- MODULES FONCTIONNELS ---
import { UsersModule } from './users/users.module';
import { PubliciteModule } from './publicite/publicite.module';
import { HubsModule } from './hubs/hubs.module';         
import { MedicamentModule } from './medicament/medicament.module';
import { DemandeModule } from './demande/demande.module';
import { PharmacieModule } from './pharmacie/pharmacie.module';

// --- ENTITÉS ---
import { Pharmacie } from './pharmacie/pharmacie.entity';
import { Demande } from './demande/demande.entity';
import { User } from './users/user.entity';
import { Publicite } from './publicite/publicite.entity';
import { Hub } from './hubs/hubs.entity';               
import { Medicament } from './medicament/medicament.entity'; 

// --- CONTROLLERS & SERVICES ---
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { join } from 'path'; // ✅ CORRECTION : 'path' au lieu de 'path/win32' pour Linux/Render

@Module({
  imports: [
    // ✅ 0. ConfigModule pour charger les variables d'environnement (Doit être en premier)
    ConfigModule.forRoot({
      isGlobal: true, // Disponible partout sans réimporter
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), 
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
      entities: [Pharmacie, Demande, User, Publicite, Hub, Medicament],
      synchronize: true, 
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    }),
    
    // 2. Moteur de Recherche (MeiliSearch)
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
    PharmacieModule,
  ],
  controllers: [
    AppController,
    AuthController
  ],
  providers: [
    AppService,
    AuthService,
    JwtStrategy
  ],
})
export class AppModule {}
