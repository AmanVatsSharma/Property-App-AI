/**
 * @file saved-search.entity.ts
 * @module saved-search
 * @description TypeORM entity for user saved property searches with alert support.
 * @author BharatERP
 * @created 2026-03-19
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
@Entity('saved_search')
export class SavedSearch {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'uuid' })
  userId: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Field(() => GraphQLJSON)
  @Column({ type: 'jsonb', default: () => "'{}'" })
  filters: Record<string, unknown>;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: true })
  alertEnabled: boolean;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  lastAlertSentAt: Date | null;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
