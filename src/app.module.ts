import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Entités
import { Pharmacie } from './pharmacie/pharmacie.entity';
import { Demande } from './demande/demande.entity';
import { User } from './users/user.entity'; // <--- AJOUT

// Controllers & Services
import { PharmacieController } from './pharmacie/pharmacie.controller';
import { PharmacieService } from './pharmacie/pharmacie.service';
import { MedicamentController } from './medicament/medicament.controller';
import { MedicamentService } from './medicament/medicament.service';
import { DemandeController } from './demande/demande.controller';
import { DemandeService } from './demande/demande.service';
import { AuthController } from './auth/auth.controller'; // <--- AJOUT
import { AuthService } from './auth/auth.service';       // <--- AJOUT
import { JwtStrategy } from './auth/jwt.strategy';       // <--- AJOUT

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'pharmaci_admin',
      password: 'pharmaci_password',
      database: 'pharmaci_db',
      entities: [Pharmacie, Demande, User], // <--- AJOUTER USER
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Pharmacie, Demande, User]), // <--- AJOUTER USER
    
    // Configuration de la sécurité JWT
    PassportModule,
    JwtModule.register({
      secret: 'SECRET_PHARMACI_KEY', // Le même secret que dans jwt.strategy
      signOptions: { expiresIn: '1d' }, // Le token dure 1 jour
    }),
  ],
  controllers: [
    PharmacieController, 
    MedicamentController, 
    DemandeController, 
    AuthController // <--- AJOUT
  ],
  providers: [
    PharmacieService, 
    MedicamentService, 
    DemandeService, 
    AuthService,  // <--- AJOUT
    JwtStrategy   // <--- AJOUT
  ],
})
export class AppModule {}
