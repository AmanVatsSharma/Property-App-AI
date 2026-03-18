/**
 * @file favorite.module.ts
 * @module favorite
 * @description Feature module: user favorites (saved properties).
 * @author BharatERP
 * @created 2026-03-18
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { FavoriteRepository } from './repository/favorite.repository';
import { FavoriteService } from './services/favorite.service';
import { FavoriteResolver } from './resolvers/favorite.resolver';
import { PropertyModule } from '@api/modules/property/property.module';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite]), PropertyModule],
  providers: [FavoriteRepository, FavoriteService, FavoriteResolver],
})
export class FavoriteModule {}
