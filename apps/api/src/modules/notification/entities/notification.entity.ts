/**
 * @file notification.entity.ts
 * @module notification
 * @description TypeORM entity for in-app notifications (stub; future push via FCM).
 * @author BharatERP
 * @created 2026-03-18
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
@Entity('notification')
export class Notification {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'uuid' })
  userId: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Field(() => String)
  @Column({ type: 'text' })
  body: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  data: Record<string, unknown> | null;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'datetime', nullable: true })
  readAt: Date | null;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;
}
