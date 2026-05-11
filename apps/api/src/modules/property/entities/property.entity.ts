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
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  title: string;

  @Field(() => String)
  @Column()
  location: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  areaId: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 200, nullable: true })
  locality: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 200, nullable: true })
  city: string | null;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  latitude: number | null;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number | null;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  price: number;

  @Field(() => String)
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

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 32, nullable: true })
  status: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 16, nullable: true })
  listingFor: string | null;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  specs: string[] | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  aiTip: string | null;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  aiScore: number | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  coverImageUrl: string | null;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  imageUrls: string[] | null;

  @Field(() => [String], { nullable: true, description: 'Nearby amenities e.g. ["metro:1.2km", "school:800m"]' })
  @Column({ type: 'simple-json', nullable: true })
  nearbyAmenities: string[] | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  createdByUserId: string | null;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: true })
  isFreeListing: boolean;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  priceDropPercent: number | null;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
