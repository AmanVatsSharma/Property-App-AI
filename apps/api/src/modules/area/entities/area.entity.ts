/**
 * @file area.entity.ts
 * @module area
 * @description Area/locality entity for region assessment; persisted scores and metadata.
 * @author BharatERP
 * @created 2025-03-13
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type AreaDataSource = 'llm' | 'external' | 'manual';

@Entity('area')
export class Area {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  locality: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  city: string;

  @Column({ type: 'varchar', length: 250 })
  localityNormalized: string;

  @Column({ type: 'varchar', length: 250 })
  cityNormalized: string;

  @Column({ type: 'int', nullable: true })
  livabilityScore: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  priceTrendPctAnnual: number | null;

  @Column({ type: 'int', nullable: true })
  connectivityScore: number | null;

  @Column({ type: 'int', nullable: true })
  schoolsScore: number | null;

  @Column({ type: 'int', nullable: true })
  safetyScore: number | null;

  @Column({ type: 'text', nullable: true })
  amenitiesSummary: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  dataSource: AreaDataSource | null;

  @Column({ type: 'timestamp', nullable: true })
  lastAssessedAt: Date | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
