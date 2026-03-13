/**
 * @file user.module.ts
 * @module user
 * @description User entity, repository, service; profile by phone (OTP login).
 * @author BharatERP
 * @created 2025-03-12
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '@api/shared/logger';
import { User } from './entities/user.entity';
import { UserRepository } from './repository/user.repository';
import { UserService } from './services/user.service';
import { UserResolver } from './resolvers/user.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User]), LoggerModule],
  providers: [UserRepository, UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
