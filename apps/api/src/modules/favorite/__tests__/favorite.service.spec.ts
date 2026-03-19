/**
 * @file favorite.service.spec.ts
 * @module favorite
 * @description Unit tests for FavoriteService: toggle, myFavorites, isFavorited.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteService } from '../services/favorite.service';
import { FavoriteRepository } from '../repository/favorite.repository';
import { Favorite } from '../entities/favorite.entity';

describe('FavoriteService', () => {
  let service: FavoriteService;
  let repo: jest.Mocked<FavoriteRepository>;

  const mockFavorite: Favorite = {
    id: 'fav-1',
    userId: 'user-1',
    propertyId: 'prop-1',
    property: null as any,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findByUserAndProperty: jest.fn(),
      findAllByUser: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoriteService,
        { provide: FavoriteRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get<FavoriteService>(FavoriteService);
    repo = module.get(FavoriteRepository) as jest.Mocked<FavoriteRepository>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('toggle', () => {
    it('should add favorite and return saved: true when not already favorited', async () => {
      repo.findByUserAndProperty.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockFavorite);
      const result = await service.toggle('user-1', 'prop-1');
      expect(result).toEqual({ saved: true });
      expect(repo.findByUserAndProperty).toHaveBeenCalledWith('user-1', 'prop-1');
      expect(repo.create).toHaveBeenCalledWith('user-1', 'prop-1');
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('should remove favorite and return saved: false when already favorited', async () => {
      repo.findByUserAndProperty.mockResolvedValue(mockFavorite);
      repo.delete.mockResolvedValue(true);
      const result = await service.toggle('user-1', 'prop-1');
      expect(result).toEqual({ saved: false });
      expect(repo.findByUserAndProperty).toHaveBeenCalledWith('user-1', 'prop-1');
      expect(repo.delete).toHaveBeenCalledWith('user-1', 'prop-1');
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('myFavorites', () => {
    it('should return list from repository', async () => {
      repo.findAllByUser.mockResolvedValue([mockFavorite]);
      const result = await service.myFavorites('user-1');
      expect(result).toEqual([mockFavorite]);
      expect(repo.findAllByUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('isFavorited', () => {
    it('should return true when favorite exists', async () => {
      repo.findByUserAndProperty.mockResolvedValue(mockFavorite);
      const result = await service.isFavorited('user-1', 'prop-1');
      expect(result).toBe(true);
      expect(repo.findByUserAndProperty).toHaveBeenCalledWith('user-1', 'prop-1');
    });

    it('should return false when favorite does not exist', async () => {
      repo.findByUserAndProperty.mockResolvedValue(null);
      const result = await service.isFavorited('user-1', 'prop-1');
      expect(result).toBe(false);
    });
  });
});
