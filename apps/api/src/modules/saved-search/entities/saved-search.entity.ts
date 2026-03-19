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
import { JsonScalar } from '@api/shared/scalars/json.scalar';

@ObjectType()
@Entity('saved_search')
export class SavedSearch {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid' })
  userId: string;

  @Field()
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Field(() => JsonScalar)
  @Column({ type: 'jsonb', default: () => "'{}'" })
  filters: Record<string, unknown>;

  @Field()
  @Column({ type: 'boolean', default: true })
  alertEnabled: boolean;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  lastAlertSentAt: Date | null;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
