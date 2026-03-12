/**
 * @file update-profile.dto.ts
 * @module user
 * @description GraphQL input for updateMyProfile mutation.
 * @author BharatERP
 * @created 2025-03-12
 */

import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, MaxLength } from 'class-validator';

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true, description: 'Display name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  displayName?: string | null;
}
