/**
 * @file broker-request.entity.ts
 * @module broker
 * @description TypeORM entity for broker verification request.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
@Entity('broker_request')
export class BrokerRequest {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'uuid', unique: true })
  userId: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  documents: Record<string, unknown> | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  adminNote: string | null;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'datetime', nullable: true })
  reviewedAt: Date | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  reviewedByUserId: string | null;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
