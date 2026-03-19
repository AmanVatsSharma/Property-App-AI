/**
 * @file saved-search.dto.ts
 * @module saved-search
 * @description GraphQL inputs for creating and updating saved searches.
 * @author BharatERP
 * @created 2026-03-19
 */

import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsObject, MaxLength } from 'class-validator';
import { JsonScalar } from '@api/shared/scalars/json.scalar';

@InputType()
export class CreateSavedSearchInput {
  @Field({ description: 'Human-readable name e.g. "3BHK Koramangala under 1Cr"' })
  @IsString()
  @MaxLength(200)
  name: string;

  @Field(() => JsonScalar, { description: 'Filter criteria matching PropertyFilterDto shape' })
  @IsObject()
  filters: Record<string, unknown>;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  alertEnabled?: boolean;
}

@InputType()
export class UpdateSavedSearchInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @Field(() => JsonScalar, { nullable: true })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  alertEnabled?: boolean;
}
