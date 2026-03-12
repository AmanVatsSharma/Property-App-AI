/**
 * @file update-property.dto.ts
 * @module property
 * @description DTO for updating a property; all fields optional.
 * @author BharatERP
 * @created 2025-03-10
 */

import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';

@InputType()
export class UpdatePropertyDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  location?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  type?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  bedrooms?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  bathrooms?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  areaSqft?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  status?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  listingFor?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specs?: string[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  aiTip?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  aiScore?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];
}
