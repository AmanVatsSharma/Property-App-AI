/**
 * @file favorite.entity.ts
 * @module favorite
 * @description TypeORM entity for Favorite; user saved property reference.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { Property } from '@api/modules/property/entities/property.entity';

@ObjectType()
@Entity('favorite')
export class Favorite {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid' })
  userId: string;

  @Field()
  @Column({ type: 'uuid' })
  propertyId: string;

  @Field(() => Property, { nullable: true })
  @ManyToOne(() => Property, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
