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
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'uuid' })
  propertyId: string;

  @Field(() => String)
  @Column({ type: 'uuid' })
  fromUserId: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string | null;

  @Field(() => String)
  @Column({ type: 'text' })
  message: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Field(() => String)
  @Column({ type: 'varchar', length: 20, default: 'open' })
  status: string;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
