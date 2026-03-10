/**
 * @file property.entity.ts
 * @module property
 * @description TypeORM entity for Property; UUID PK, fields aligned with frontend search/detail.
 * @author BharatERP
 * @created 2025-03-10
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
@Entity('property')
export class Property {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  location: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  price: number;

  @Field()
  @Column({ default: 'apartment' })
  type: string;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  bedrooms: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  bathrooms: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  areaSqft: number | null;

  @Field({ nullable: true })
  @Column({ nullable: true })
  status: string | null;

  @Field({ nullable: true })
  @Column({ nullable: true })
  listingFor: string | null;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  specs: string[] | null;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  aiTip: string | null;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  aiScore: number | null;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
