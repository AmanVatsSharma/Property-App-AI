/**
 * @file favorite.repository.ts
 * @module favorite
 * @description Data access for Favorite entity; findByUserAndProperty, findAllByUser, create, delete.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';

@Injectable()
export class FavoriteRepository {
  constructor(
    @InjectRepository(Favorite)
    private readonly repo: Repository<Favorite>,
  ) {}

  async findByUserAndProperty(userId: string, propertyId: string): Promise<Favorite | null> {
    return this.repo.findOne({ where: { userId, propertyId } });
  }

  async findAllByUser(userId: string): Promise<Favorite[]> {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async create(userId: string, propertyId: string): Promise<Favorite> {
    const entity = this.repo.create({ userId, propertyId });
    return this.repo.save(entity);
  }

  async delete(userId: string, propertyId: string): Promise<boolean> {
    const result = await this.repo.delete({ userId, propertyId });
    return (result.affected ?? 0) > 0;
  }
}
