/**
 * @file broker-request.service.spec.ts
 * @module broker
 * @description Unit tests for BrokerRequestService: requestBrokerVerification, approveBrokerRequest, rejectBrokerRequest.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BrokerRequestService } from '../services/broker-request.service';
import { BrokerRequestRepository } from '../repository/broker-request.repository';
import { UserService } from '@api/modules/user/services/user.service';
import { UserRole } from '@api/modules/user/entities/user.entity';
import { BrokerRequest } from '../entities/broker-request.entity';

describe('BrokerRequestService', () => {
  let service: BrokerRequestService;
  let repo: jest.Mocked<BrokerRequestRepository>;
  let userService: jest.Mocked<Pick<UserService, 'findById' | 'setRole'>>;

  const mockUser = { id: 'user-1', phone: '9876543210', displayName: null, role: UserRole.USER };
  const mockRequest: BrokerRequest = {
    id: 'req-1',
    userId: 'user-1',
    status: 'pending',
    documents: null,
    adminNote: null,
    reviewedAt: null,
    reviewedByUserId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
    };
    const mockUserService = {
      findById: jest.fn().mockResolvedValue(mockUser),
      setRole: jest.fn().mockResolvedValue({ ...mockUser, role: UserRole.BROKER }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrokerRequestService,
        { provide: BrokerRequestRepository, useValue: mockRepo },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();
    service = module.get<BrokerRequestService>(BrokerRequestService);
    repo = module.get(BrokerRequestRepository) as jest.Mocked<BrokerRequestRepository>;
    userService = module.get(UserService) as jest.Mocked<Pick<UserService, 'findById' | 'setRole'>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestBrokerVerification', () => {
    it('should create new request when user is not broker and no existing request', async () => {
      repo.findByUserId.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockRequest);
      const result = await service.requestBrokerVerification('user-1');
      expect(result).toEqual(mockRequest);
      expect(userService.findById).toHaveBeenCalledWith('user-1');
      expect(repo.create).toHaveBeenCalledWith('user-1', null);
      expect(repo.findByUserId).toHaveBeenCalledWith('user-1');
    });

    it('should throw ForbiddenException when user is already broker', async () => {
      (userService.findById as jest.Mock).mockResolvedValue({ ...mockUser, role: UserRole.BROKER });
      await expect(service.requestBrokerVerification('user-1')).rejects.toThrow(ForbiddenException);
      await expect(service.requestBrokerVerification('user-1')).rejects.toThrow('Already a verified broker');
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should return existing pending request without creating again', async () => {
      repo.findByUserId.mockResolvedValue(mockRequest);
      const result = await service.requestBrokerVerification('user-1');
      expect(result).toEqual(mockRequest);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      (userService.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.requestBrokerVerification('missing')).rejects.toThrow(NotFoundException);
      await expect(service.requestBrokerVerification('missing')).rejects.toThrow('User not found');
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('approveBrokerRequest', () => {
    it('should call setRole and updateStatus and return updated request', async () => {
      repo.findById.mockResolvedValue(mockRequest);
      const approved = { ...mockRequest, status: 'approved' };
      repo.updateStatus.mockResolvedValue(approved);
      const result = await service.approveBrokerRequest('req-1', 'admin-1');
      expect(result.status).toBe('approved');
      expect(userService.setRole).toHaveBeenCalledWith('user-1', UserRole.BROKER);
      expect(repo.updateStatus).toHaveBeenCalledWith('req-1', 'approved', 'admin-1');
    });

    it('should throw NotFoundException when request not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.approveBrokerRequest('missing', 'admin-1')).rejects.toThrow(NotFoundException);
      await expect(service.approveBrokerRequest('missing', 'admin-1')).rejects.toThrow('Broker request not found');
      expect(userService.setRole).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when request is not pending', async () => {
      repo.findById.mockResolvedValue({ ...mockRequest, status: 'approved' });
      await expect(service.approveBrokerRequest('req-1', 'admin-1')).rejects.toThrow(ForbiddenException);
      await expect(service.approveBrokerRequest('req-1', 'admin-1')).rejects.toThrow(/already approved/);
      expect(userService.setRole).not.toHaveBeenCalled();
    });
  });

  describe('rejectBrokerRequest', () => {
    it('should call updateStatus with rejected and adminNote and not setRole', async () => {
      repo.findById.mockResolvedValue(mockRequest);
      const rejected = { ...mockRequest, status: 'rejected', adminNote: 'Incomplete docs' };
      repo.updateStatus.mockResolvedValue(rejected);
      const result = await service.rejectBrokerRequest('req-1', 'admin-1', 'Incomplete docs');
      expect(result.status).toBe('rejected');
      expect(repo.updateStatus).toHaveBeenCalledWith('req-1', 'rejected', 'admin-1', 'Incomplete docs');
      expect(userService.setRole).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when request not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.rejectBrokerRequest('missing', 'admin-1')).rejects.toThrow(NotFoundException);
      expect(repo.updateStatus).not.toHaveBeenCalled();
    });
  });
});
