/**
 * @file enquiry.service.spec.ts
 * @module enquiry
 * @description Unit tests for EnquiryService: send, myReceived, mySent.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EnquiryService } from '../services/enquiry.service';
import { EnquiryRepository } from '../repository/enquiry.repository';
import { PropertyService } from '@api/modules/property/services/property.service';
import { NotificationService } from '@api/modules/notification/services/notification.service';
import { Enquiry } from '../entities/enquiry.entity';
import { CreateEnquiryInput } from '../dtos/create-enquiry.input';

describe('EnquiryService', () => {
  let service: EnquiryService;
  let enquiryRepo: jest.Mocked<EnquiryRepository>;
  let propertyService: jest.Mocked<Pick<PropertyService, 'findOne'>>;
  let notificationService: jest.Mocked<Pick<NotificationService, 'create'>>;

  const mockPropertyWithOwner = {
    id: 'prop-1',
    title: 'Test',
    location: 'City',
    createdByUserId: 'owner-1',
  };

  const mockEnquiry: Enquiry = {
    id: 'enq-1',
    propertyId: 'prop-1',
    fromUserId: 'user-1',
    ownerUserId: 'owner-1',
    message: 'Interested',
    phone: null,
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockEnquiryRepo = {
      create: jest.fn(),
      findByOwnerUserId: jest.fn(),
      findByFromUserId: jest.fn(),
    };
    const mockPropertyService = {
      findOne: jest.fn().mockResolvedValue(mockPropertyWithOwner),
    };
    const mockNotificationService = {
      create: jest.fn().mockResolvedValue({}),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnquiryService,
        { provide: EnquiryRepository, useValue: mockEnquiryRepo },
        { provide: PropertyService, useValue: mockPropertyService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();
    service = module.get<EnquiryService>(EnquiryService);
    enquiryRepo = module.get(EnquiryRepository) as jest.Mocked<EnquiryRepository>;
    propertyService = module.get(PropertyService) as jest.Mocked<Pick<PropertyService, 'findOne'>>;
    notificationService = module.get(NotificationService) as jest.Mocked<Pick<NotificationService, 'create'>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('send', () => {
    it('should create enquiry with ownerUserId from property and return created enquiry', async () => {
      const input: CreateEnquiryInput = { propertyId: 'prop-1', message: 'Interested', phone: undefined };
      enquiryRepo.create.mockResolvedValue(mockEnquiry);
      const result = await service.send('user-1', input);
      expect(result).toEqual(mockEnquiry);
      expect(propertyService.findOne).toHaveBeenCalledWith('prop-1');
      expect(enquiryRepo.create).toHaveBeenCalledWith({
        propertyId: 'prop-1',
        fromUserId: 'user-1',
        ownerUserId: 'owner-1',
        message: 'Interested',
        phone: null,
      });
    });

    it('should create enquiry with ownerUserId null when property has no owner', async () => {
      (propertyService.findOne as jest.Mock).mockResolvedValue({ ...mockPropertyWithOwner, createdByUserId: null });
      const input: CreateEnquiryInput = { propertyId: 'prop-1', message: 'Hi' };
      enquiryRepo.create.mockResolvedValue({ ...mockEnquiry, ownerUserId: null });
      const result = await service.send('user-1', input);
      expect(result.ownerUserId).toBeNull();
      expect(enquiryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ ownerUserId: null, propertyId: 'prop-1', fromUserId: 'user-1', message: 'Hi' }),
      );
    });
  });

  describe('myReceived', () => {
    it('should return enquiries from repository', async () => {
      enquiryRepo.findByOwnerUserId.mockResolvedValue([mockEnquiry]);
      const result = await service.myReceived('owner-1');
      expect(result).toEqual([mockEnquiry]);
      expect(enquiryRepo.findByOwnerUserId).toHaveBeenCalledWith('owner-1');
    });
  });

  describe('mySent', () => {
    it('should return enquiries from repository', async () => {
      enquiryRepo.findByFromUserId.mockResolvedValue([mockEnquiry]);
      const result = await service.mySent('user-1');
      expect(result).toEqual([mockEnquiry]);
      expect(enquiryRepo.findByFromUserId).toHaveBeenCalledWith('user-1');
    });
  });
});
