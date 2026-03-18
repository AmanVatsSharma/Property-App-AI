/**
 * @file enquiry.entity.ts
 * @module enquiry
 * @description TypeORM entity for Enquiry; buyer message about a listing.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
@Entity('enquiry')
export class Enquiry {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid' })
  propertyId: string;

  @Field()
  @Column({ type: 'uuid' })
  fromUserId: string;

  @Field({ nullable: true })
  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string | null;

  @Field()
  @Column({ type: 'text' })
  message: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Field()
  @Column({ type: 'varchar', length: 20, default: 'open' })
  status: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
