/**
 * @file notification.service.spec.ts
 * @module notification
 * @description Unit tests for NotificationService: create, myNotifications, markRead, markAllRead.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../services/notification.service';
import { NotificationRepository } from '../repository/notification.repository';
import { Notification } from '../entities/notification.entity';

describe('NotificationService', () => {
  let service: NotificationService;
  let repo: jest.Mocked<NotificationRepository>;

  const mockNotification: Notification = {
    id: 'notif-1',
    userId: 'user-1',
    type: 'enquiry',
    title: 'New enquiry',
    body: 'Message text',
    data: { enquiryId: 'enq-1', propertyId: 'prop-1' },
    readAt: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      updateReadAt: jest.fn(),
      markAllReadByUserId: jest.fn().mockResolvedValue(undefined),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: NotificationRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get<NotificationService>(NotificationService);
    repo = module.get(NotificationRepository) as jest.Mocked<NotificationRepository>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call repo.create with userId, type, title, body, data and return created entity', async () => {
      repo.create.mockResolvedValue(mockNotification);
      const result = await service.create(
        'user-1',
        'enquiry',
        'New enquiry',
        'Message text',
        { enquiryId: 'enq-1', propertyId: 'prop-1' },
      );
      expect(result).toEqual(mockNotification);
      expect(repo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        type: 'enquiry',
        title: 'New enquiry',
        body: 'Message text',
        data: { enquiryId: 'enq-1', propertyId: 'prop-1' },
      });
    });

    it('should pass null for data when not provided', async () => {
      repo.create.mockResolvedValue({ ...mockNotification, data: null });
      await service.create('user-1', 'info', 'Title', 'Body');
      expect(repo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        type: 'info',
        title: 'Title',
        body: 'Body',
        data: null,
      });
    });
  });

  describe('myNotifications', () => {
    it('should return list from repository with limit and offset', async () => {
      repo.findByUserId.mockResolvedValue([mockNotification]);
      const result = await service.myNotifications('user-1', 20, 0);
      expect(result).toEqual([mockNotification]);
      expect(repo.findByUserId).toHaveBeenCalledWith('user-1', 20, 0);
    });
  });

  describe('markRead', () => {
    it('should return updated entity when repo.updateReadAt returns it', async () => {
      const read = { ...mockNotification, readAt: new Date() };
      repo.updateReadAt.mockResolvedValue(read);
      const result = await service.markRead('notif-1', 'user-1');
      expect(result).toEqual(read);
      expect(repo.updateReadAt).toHaveBeenCalledWith('notif-1', 'user-1');
    });

    it('should return null when repo.updateReadAt returns null', async () => {
      repo.updateReadAt.mockResolvedValue(null);
      const result = await service.markRead('notif-1', 'user-1');
      expect(result).toBeNull();
    });
  });

  describe('markAllRead', () => {
    it('should call repo.markAllReadByUserId', async () => {
      await service.markAllRead('user-1');
      expect(repo.markAllReadByUserId).toHaveBeenCalledWith('user-1');
    });
  });
});
