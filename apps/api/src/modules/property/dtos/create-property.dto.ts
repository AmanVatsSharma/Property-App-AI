/**
 * @file create-property.dto.ts
 * @module property
 * @description DTO for creating a property; used by createProperty mutation.
 * @author BharatERP
 * @created 2025-03-10
 */

import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';

@InputType()
export class CreatePropertyDto {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String)
  @IsString()
  location: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  areaId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  locality?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  city?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => String, { defaultValue: 'apartment' })
  @IsString()
  @IsOptional()
  type?: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  bedrooms?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  bathrooms?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  areaSqft?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  status?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  listingFor?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specs?: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  aiTip?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  aiScore?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  nearbyAmenities?: string[];
}
