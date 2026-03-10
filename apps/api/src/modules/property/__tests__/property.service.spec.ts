/**
 * @file property.service.spec.ts
 * @module property
 * @description Unit tests for PropertyService.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PropertyNotFoundError } from '../../../common/errors';
import { PropertyService } from '../services/property.service';
import { PropertyRepository } from '../repository/property.repository';
import { Property } from '../entities/property.entity';

describe('PropertyService', () => {
  let service: PropertyService;
  let repo: jest.Mocked<PropertyRepository>;

  const mockProperty: Property = {
    id: 'uuid-1',
    title: 'Test Property',
    location: 'Test City',
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
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyService,
        { provide: PropertyRepository, useValue: mockRepo },
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
      await expect(service.findOne('missing')).rejects.toThrow(PropertyNotFoundError);
    });
  });

  describe('create', () => {
    it('should delegate to repository create', async () => {
      repo.create.mockResolvedValue(mockProperty);
      const dto = { title: 'New', location: 'City', price: 500000 };
      const result = await service.create(dto as any);
      expect(result).toEqual(mockProperty);
      expect(repo.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should throw when property not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('missing', { title: 'Updated' } as any)).rejects.toThrow(
        PropertyNotFoundError,
      );
    });

    it('should delegate to repository update when found', async () => {
      repo.findById.mockResolvedValue(mockProperty);
      repo.update.mockResolvedValue({ ...mockProperty, title: 'Updated' });
      const result = await service.update('uuid-1', { title: 'Updated' } as any);
      expect(result.title).toBe('Updated');
      expect(repo.update).toHaveBeenCalledWith(mockProperty, { title: 'Updated' });
    });
  });

  describe('remove', () => {
    it('should delegate to repository delete', async () => {
      repo.delete.mockResolvedValue(true);
      const result = await service.remove('uuid-1');
      expect(result).toBe(true);
      expect(repo.delete).toHaveBeenCalledWith('uuid-1');
    });
  });
});
