import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MeiliSearchModule } from 'nestjs-meilisearch';
import { join } from 'path'; // ✅ CORRECTION : 'path' tout court (pas win32)

// --- MODULES FONCTIONNELS ---
import { UsersModule } from './users/users.module';
import { PubliciteModule } from './publicite/publicite.module';
import { HubsModule } from './hubs/hubs.module';         
import { MedicamentModule } from './medicament/medicament.module';
import { DemandeModule } from './demande/demande.module';
import { PharmacieModule } from './pharmacie/pharmacie.module';

// --- CONTROLLERS & SERVICES ---
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    // 1. Fichiers Statiques (Vue Web)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    
    // 2. Base de Données PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL, 
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'pharmaci',
      
      // ✅ CORRECTION MAJEURE : Chargement automatique des entités
      // Cela permet de trouver 'Publicite' même après la compilation
      autoLoadEntities: true, 
      synchronize: true, // À garder à true pour le prototype
      
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    }),
    
    // 3. Moteur de Recherche (MeiliSearch)
    MeiliSearchModule.forRoot({
      host: process.env.MEILI_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILI_KEY || 'masterKey',
    }),
    
    // 4. Authentification
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SECRET_PHARMACI_KEY', 
      signOptions: { expiresIn: '1d' }, 
    }),

    // 5. Modules Métiers
    UsersModule, 
    PubliciteModule,
    HubsModule,      
    MedicamentModule,
    DemandeModule,
    PharmacieModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, JwtStrategy],
})
export class AppModule {}
