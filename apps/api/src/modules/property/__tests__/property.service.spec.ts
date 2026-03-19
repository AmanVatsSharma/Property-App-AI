/**
 * @file property.service.spec.ts
 * @module property
 * @description Unit tests for PropertyService.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PropertyNotFoundError } from '@api/common/errors';
import { PropertyService } from '../services/property.service';
import { PropertyRepository } from '../repository/property.repository';
import { GeocodingService } from '../services/geocoding.service';
import { NearbyService } from '../services/nearby.service';
import { AreaService } from '@api/modules/area/services/area.service';
import { LoggerService } from '@api/shared/logger';
import { CacheService } from '@api/shared/cache/cache.service';
import { MetricsService } from '@api/modules/metrics/services/metrics.service';
import { Property } from '../entities/property.entity';
import { UserRole } from '@api/modules/user/entities/user.entity';

describe('PropertyService', () => {
  let service: PropertyService;
  let repo: jest.Mocked<PropertyRepository>;

  const mockProperty: Property = {
    id: 'uuid-1',
    title: 'Test Property',
    location: 'Test City',
    areaId: null,
    locality: null,
    city: null,
    latitude: null,
    longitude: null,
    price: 1000000,
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1200,
    status: 'ready',
    listingFor: 'sell',
    specs: null,
    aiTip: null,
    aiScore: null,
    coverImageUrl: null,
    imageUrls: null,
    nearbyAmenities: null,
    createdByUserId: null,
    isFreeListing: true,
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let cache: jest.Mocked<Pick<CacheService, 'get' | 'set' | 'del'>>;

  beforeEach(async () => {
    const mockRepo = {
      findAllWithFilters: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countByUserId: jest.fn(),
      incrementViewCount: jest.fn().mockResolvedValue(undefined),
      findPageWithFilters: jest.fn().mockResolvedValue({ items: [], nextCursor: null, total: 0 }),
    };
    const mockCache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    const mockMetrics = { recordPropertyCreated: jest.fn() };
    const mockLogger = { debug: jest.fn(), log: jest.fn(), error: jest.fn(), warn: jest.fn(), info: jest.fn(), trace: jest.fn() };
    const mockGeocoding = { geocode: jest.fn().mockResolvedValue(null), reverseGeocode: jest.fn().mockResolvedValue(null) };
    const mockAreaService = {
      getOrCreate: jest.fn().mockResolvedValue({ id: 'area-1', locality: 'Test City', city: '' }),
    };
    const mockNearbyService = { getNearby: jest.fn().mockResolvedValue([]) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyService,
        { provide: PropertyRepository, useValue: mockRepo },
        { provide: GeocodingService, useValue: mockGeocoding },
        { provide: NearbyService, useValue: mockNearbyService },
        { provide: AreaService, useValue: mockAreaService },
        { provide: LoggerService, useValue: mockLogger },
        { provide: CacheService, useValue: mockCache },
        { provide: MetricsService, useValue: mockMetrics },
      ],
    }).compile();
    service = module.get<PropertyService>(PropertyService);
    repo = module.get(PropertyRepository) as jest.Mocked<PropertyRepository>;
    cache = module.get(CacheService) as jest.Mocked<Pick<CacheService, 'get' | 'set' | 'del'>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array from repository', async () => {
      repo.findAllWithFilters.mockResolvedValue([mockProperty]);
      const result = await service.findAll({});
      expect(result).toEqual([mockProperty]);
      expect(repo.findAllWithFilters).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return property when found', async () => {
      repo.findById.mockResolvedValue(mockProperty);
      const result = await service.findOne('uuid-1');
      expect(result).toEqual(mockProperty);
      expect(repo.findById).toHaveBeenCalledWith('uuid-1');
    });

    it('should return cached property when cache hit and not call repo or incrementViewCount', async () => {
      const cached = { ...mockProperty, title: 'Cached' };
      (cache.get as jest.Mock).mockResolvedValue(cached);
      const result = await service.findOne('uuid-1');
      expect(result).toEqual(cached);
      expect(repo.findById).not.toHaveBeenCalled();
      expect(repo.incrementViewCount).not.toHaveBeenCalled();
    });

    it('should throw PropertyNotFoundError when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toMatchObject({
        name: 'PropertyNotFoundError',
        message: expect.stringContaining('not found'),
      });
    });
  });

  describe('create', () => {
    it('should throw when user is not signed in', async () => {
      const dto = { title: 'New', location: 'City', price: 500000 };
      await expect(service.create(dto as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should mark first listing as free', async () => {
      repo.countByUserId.mockResolvedValue(0);
      repo.create.mockResolvedValue(mockProperty);
      const dto = { title: 'New', location: 'City', price: 500000 };
      const result = await service.create(dto as any, 'user-1');
      expect(result).toEqual(mockProperty);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New', location: 'City', price: 500000 }),
        'user-1',
        true,
      );
    });

    it('should throw ForbiddenException when free listing limit reached', async () => {
      repo.countByUserId.mockResolvedValue(1);
      const dto = { title: 'New', location: 'City', price: 500000 };
      await expect(service.create(dto as any, 'user-1')).rejects.toThrow(ForbiddenException);
      await expect(service.create(dto as any, 'user-1')).rejects.toThrow(/Free listing limit reached/);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should throw when property not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.update('missing', { title: 'Updated' } as any, 'user-1', 'user'),
      ).rejects.toMatchObject({
        name: 'PropertyNotFoundError',
        message: expect.stringContaining('not found'),
      });
    });

    it('should throw ForbiddenException when user is not owner and not admin', async () => {
      const owned = { ...mockProperty, createdByUserId: 'owner-1' };
      repo.findById.mockResolvedValue(owned);
      await expect(
        service.update('uuid-1', { title: 'Updated' } as any, 'user-2', UserRole.USER),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.update('uuid-1', { title: 'Updated' } as any, 'user-2', UserRole.USER),
      ).rejects.toThrow('You do not own this listing');
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should delegate to repository update when found and user is owner', async () => {
      const owned = { ...mockProperty, createdByUserId: 'user-1' };
      repo.findById.mockResolvedValue(owned);
      repo.update.mockResolvedValue({ ...owned, title: 'Updated' });
      const result = await service.update('uuid-1', { title: 'Updated' } as any, 'user-1', 'user');
      expect(result.title).toBe('Updated');
      expect(repo.update).toHaveBeenCalledWith(owned, { title: 'Updated' });
    });

    it('should succeed when user is admin even if not owner', async () => {
      const owned = { ...mockProperty, createdByUserId: 'owner-1' };
      repo.findById.mockResolvedValue(owned);
      repo.update.mockResolvedValue({ ...owned, title: 'Updated' });
      const result = await service.update('uuid-1', { title: 'Updated' } as any, 'admin-1', UserRole.ADMIN);
      expect(result.title).toBe('Updated');
      expect(repo.update).toHaveBeenCalledWith(owned, { title: 'Updated' });
    });
  });

  describe('remove', () => {
    it('should throw ForbiddenException when user is not owner and not admin', async () => {
      const owned = { ...mockProperty, createdByUserId: 'owner-1' };
      repo.findById.mockResolvedValue(owned);
      await expect(service.remove('uuid-1', 'user-2', UserRole.USER)).rejects.toThrow(ForbiddenException);
      await expect(service.remove('uuid-1', 'user-2', UserRole.USER)).rejects.toThrow('You do not own this listing');
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('should delegate to repository delete when user is owner', async () => {
      const owned = { ...mockProperty, createdByUserId: 'user-1' };
      repo.findById.mockResolvedValue(owned);
      repo.delete.mockResolvedValue(true);
      const result = await service.remove('uuid-1', 'user-1', 'user');
      expect(result).toBe(true);
      expect(repo.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('should succeed when user is admin even if not owner', async () => {
      const owned = { ...mockProperty, createdByUserId: 'owner-1' };
      repo.findById.mockResolvedValue(owned);
      repo.delete.mockResolvedValue(true);
      const result = await service.remove('uuid-1', 'admin-1', UserRole.ADMIN);
      expect(result).toBe(true);
      expect(repo.delete).toHaveBeenCalledWith('uuid-1');
    });
  });

  describe('changeStatus', () => {
    it('should throw ForbiddenException when user is not owner and not admin', async () => {
      const owned = { ...mockProperty, createdByUserId: 'owner-1' };
      repo.findById.mockResolvedValue(owned);
      await expect(
        service.changeStatus('uuid-1', 'active', 'user-2', UserRole.USER),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should succeed when user is admin even if not owner', async () => {
      const owned = { ...mockProperty, createdByUserId: 'owner-1' };
      repo.findById.mockResolvedValue(owned);
      repo.update.mockResolvedValue({ ...owned, status: 'sold' });
      const result = await service.changeStatus('uuid-1', 'sold', 'admin-1', UserRole.ADMIN);
      expect(result.status).toBe('sold');
      expect(repo.update).toHaveBeenCalledWith(owned, { status: 'sold' });
    });

    it('should throw ValidationError for invalid status', async () => {
      const owned = { ...mockProperty, createdByUserId: 'user-1' };
      repo.findById.mockResolvedValue(owned);
      await expect(
        service.changeStatus('uuid-1', 'invalid' as any, 'user-1', UserRole.USER),
      ).rejects.toMatchObject({ name: 'ValidationError', message: expect.stringMatching(/Invalid status/) });
      expect(repo.update).not.toHaveBeenCalled();
    });
  });
});
