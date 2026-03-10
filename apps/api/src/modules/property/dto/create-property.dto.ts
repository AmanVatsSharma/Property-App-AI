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
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  location: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;

  @Field({ defaultValue: 'apartment' })
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
}
