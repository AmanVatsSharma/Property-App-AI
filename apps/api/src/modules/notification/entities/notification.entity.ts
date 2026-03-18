/**
 * @file notification.entity.ts
 * @module notification
 * @description TypeORM entity for in-app notifications (stub; future push via FCM).
 * @author BharatERP
 * @created 2026-03-18
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { JsonScalar } from '@api/shared/scalars/json.scalar';

@ObjectType()
@Entity('notification')
export class Notification {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid' })
  userId: string;

  @Field()
  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Field()
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Field()
  @Column({ type: 'text' })
  body: string;

  @Field(() => JsonScalar, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, unknown> | null;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  readAt: Date | null;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
