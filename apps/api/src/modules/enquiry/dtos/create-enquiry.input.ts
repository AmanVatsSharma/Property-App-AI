/**
 * @file create-enquiry.input.ts
 * @module enquiry
 * @description GraphQL input for sending an enquiry.
 * @author BharatERP
 * @created 2026-03-18
 */

import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, MaxLength } from 'class-validator';

@InputType()
export class CreateEnquiryInput {
  @Field({ description: 'Property ID to enquire about' })
  @IsString()
  propertyId: string;

  @Field({ description: 'Message (max 1000 chars)' })
  @IsString()
  @MaxLength(1000)
  message: string;

  @Field({ nullable: true, description: 'Optional contact phone' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
