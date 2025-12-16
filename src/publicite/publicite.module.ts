import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publicite } from './publicite.entity';
import { PubliciteController } from './publicite.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Publicite])],
  controllers: [PubliciteController],
})
export class PubliciteModule {}
