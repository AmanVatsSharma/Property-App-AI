/**
 * @file property.service.spec.ts
 * @module property
 * @description Unit tests for PropertyService.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { PropertyNotFoundError } from '@api/common/errors';
import { PropertyService } from '../services/property.service';
import { PropertyRepository } from '../repository/property.repository';
import { GeocodingService } from '../services/geocoding.service';
import { NearbyService } from '../services/nearby.service';
import { AreaService } from '@api/modules/area/services/area.service';
import { LoggerService } from '@api/shared/logger';
import { Property } from '../entities/property.entity';

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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findAllWithFilters: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countByUserId: jest.fn(),
    };
    const mockLogger = { debug: jest.fn(), log: jest.fn(), error: jest.fn(), warn: jest.fn() };
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
      ],
    }).compile();
    service = module.get<PropertyService>(PropertyService);
    repo = module.get(PropertyRepository) as jest.Mocked<PropertyRepository>;
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

    it('should mark non-first listing as paid tier', async () => {
      repo.countByUserId.mockResolvedValue(2);
      repo.create.mockResolvedValue({ ...mockProperty, isFreeListing: false });
      const dto = { title: 'New', location: 'City', price: 500000 };
      await service.create(dto as any, 'user-1');
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New', location: 'City', price: 500000 }),
        'user-1',
        false,
      );
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

    it('should delegate to repository update when found and user is owner', async () => {
      const owned = { ...mockProperty, createdByUserId: 'user-1' };
      repo.findById.mockResolvedValue(owned);
      repo.update.mockResolvedValue({ ...owned, title: 'Updated' });
      const result = await service.update('uuid-1', { title: 'Updated' } as any, 'user-1', 'user');
      expect(result.title).toBe('Updated');
      expect(repo.update).toHaveBeenCalledWith(owned, { title: 'Updated' });
    });
  });

  describe('remove', () => {
    it('should delegate to repository delete when user is owner', async () => {
      const owned = { ...mockProperty, createdByUserId: 'user-1' };
      repo.findById.mockResolvedValue(owned);
      repo.delete.mockResolvedValue(true);
      const result = await service.remove('uuid-1', 'user-1', 'user');
      expect(result).toBe(true);
      expect(repo.delete).toHaveBeenCalledWith('uuid-1');
    });
  });
});
