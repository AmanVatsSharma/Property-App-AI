/**
 * @file favorite.service.ts
 * @module favorite
 * @description Business logic for toggling and listing user favorites.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Injectable } from '@nestjs/common';
import { Favorite } from '../entities/favorite.entity';
import { FavoriteRepository } from '../repository/favorite.repository';
import { ToggleFavoriteResult } from '../dtos/toggle-favorite-result.dto';

@Injectable()
export class FavoriteService {
  constructor(private readonly favoriteRepo: FavoriteRepository) {}

  async toggle(userId: string, propertyId: string): Promise<ToggleFavoriteResult> {
    const existing = await this.favoriteRepo.findByUserAndProperty(userId, propertyId);
    if (existing) {
      await this.favoriteRepo.delete(userId, propertyId);
      return { saved: false };
    }
    await this.favoriteRepo.create(userId, propertyId);
    return { saved: true };
  }

  async myFavorites(userId: string): Promise<Favorite[]> {
    return this.favoriteRepo.findAllByUser(userId);
  }

  async isFavorited(userId: string, propertyId: string): Promise<boolean> {
    const f = await this.favoriteRepo.findByUserAndProperty(userId, propertyId);
    return f !== null;
  }
}
