/**
 * @file user.entity.ts
 * @module user
 * @description User entity: unique phone, optional displayName, role (user/broker/admin); created on first OTP login.
 * @author BharatERP
 * @created 2025-03-12
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  USER = 'user',
  BROKER = 'broker',
  ADMIN = 'admin',
}

registerEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
@Entity('user')
export class User {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true, length: 20 })
  phone: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 200, nullable: true })
  displayName: string | null;

  @Field(() => UserRole)
  @Column({ type: 'varchar', length: 20, default: UserRole.USER })
  role: UserRole;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
