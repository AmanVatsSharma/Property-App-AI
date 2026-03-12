/**
 * @file property-filter.dto.ts
 * @module property
 * @description Optional filter args for properties query (search/list).
 * @author BharatERP
 * @created 2025-03-10
 */

import { ArgsType, Field, Float, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

@ArgsType()
export class PropertyFilterDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  type?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field(() => Float, { nullable: true, description: 'Map viewport south bound' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  minLat?: number;

  @Field(() => Float, { nullable: true, description: 'Map viewport north bound' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  maxLat?: number;

  @Field(() => Float, { nullable: true, description: 'Map viewport west bound' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  minLng?: number;

  @Field(() => Float, { nullable: true, description: 'Map viewport east bound' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  maxLng?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(20)
  bedrooms?: number;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
