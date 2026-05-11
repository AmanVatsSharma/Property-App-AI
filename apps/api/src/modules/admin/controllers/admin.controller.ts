/**
 * @file admin.controller.ts
 * @module admin
 * @description REST API controller for admin/platform owner operations
 * @author AmanVatsSharma
 * @created 2026-05-11
 */

import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminGuard } from '@api/common/guards/admin.guard';
import { AdminService } from '../services/admin.service';
import {
  PropertyListQuery,
  UserListQuery,
  BrokerVerificationQuery,
  AIMetricsQuery,
  PropertyStatusUpdateDto,
  BrokerVerificationDto,
  EnquiryStatusUpdateDto,
  AuditLogQuery,
} from '../dtos/admin-rest.dto';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Stats ─────────────────────────────────────────

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    return this.adminService.getStats();
  }

  // ─── Properties ────────────────────────────────────

  @Get('properties')
  @HttpCode(HttpStatus.OK)
  async getProperties(@Query() query: PropertyListQuery) {
    return this.adminService.getProperties(query);
  }

  @Get('properties/:id')
  @HttpCode(HttpStatus.OK)
  async getProperty(@Param('id') id: string) {
    return this.adminService.getProperties({ ...{}, limit: 1 }).then(({ data }) => {
      const property = data.find(p => p.id === id);
      if (!property) {
        throw new Error('Property not found');
      }
      return property;
    });
  }

  @Patch('properties/:id')
  @HttpCode(HttpStatus.OK)
  async updateProperty(
    @Param('id') id: string,
    @Body() dto: PropertyStatusUpdateDto,
  ) {
    return this.adminService.updatePropertyStatus(id, dto.status, dto.reason);
  }

  @Delete('properties/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProperty(@Param('id') id: string) {
    // Soft delete by archiving
    return this.adminService.updatePropertyStatus(id, 'archived' as any, 'Deleted by admin');
  }

  // ─── Users ─────────────────────────────────────────

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getUsers(@Query() query: UserListQuery) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  @HttpCode(HttpStatus.OK)
  async getUser(@Param('id') id: string) {
    return this.adminService.getUsers({ limit: 1 }).then(({ data }) => {
      const user = data.find(u => u.id === id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    });
  }

  @Patch('users/:id/role')
  @HttpCode(HttpStatus.OK)
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    return this.adminService.setUserRole(id, role as any);
  }

  // ─── Brokers ───────────────────────────────────────

  @Get('brokers')
  @HttpCode(HttpStatus.OK)
  async getBrokers(@Query() query: BrokerVerificationQuery) {
    return this.adminService.getBrokers(query);
  }

  @Patch('brokers/:id/verify')
  @HttpCode(HttpStatus.OK)
  async verifyBroker(
    @Param('id') id: string,
    @Body() dto: BrokerVerificationDto,
  ) {
    return this.adminService.verifyBroker(id, dto.status, dto.reason, dto.reraVerified);
  }

  // ─── Enquiries ─────────────────────────────────────

  @Get('enquiries')
  @HttpCode(HttpStatus.OK)
  async getEnquiries(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getEnquiries(limit, offset, status as any);
  }

  @Patch('enquiries/:id')
  @HttpCode(HttpStatus.OK)
  async updateEnquiry(
    @Param('id') id: string,
    @Body() dto: EnquiryStatusUpdateDto,
  ) {
    return this.adminService.updateEnquiryStatus(id, dto.status, dto.notes);
  }

  // ─── AI Metrics ────────────────────────────────────

  @Get('ai-metrics')
  @HttpCode(HttpStatus.OK)
  async getAIMetrics(@Query() query: AIMetricsQuery) {
    return this.adminService.getAIMetrics(query);
  }

  // ─── Audit Logs ────────────────────────────────────

  @Get('audit-logs')
  @HttpCode(HttpStatus.OK)
  async getAuditLogs(@Query() query: AuditLogQuery) {
    return this.adminService.getAuditLogs(query);
  }
}