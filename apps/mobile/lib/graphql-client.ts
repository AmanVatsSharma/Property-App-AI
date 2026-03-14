/**
 * @file graphql-client.ts
 * @module lib
 * @description GraphQL client for Nest API (property + agent). Uses shared runGraphQL.
 * @author BharatERP
 * @created 2025-03-12
 */

import { runGraphQL } from '@property-app-ai/shared';

function getGraphQLUrl(): string {
  const base = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_GRAPHQL_HTTP;
  if (base) return base.startsWith('http') ? base.replace(/\/$/, '') + (base.includes('graphql') ? '' : '/graphql') : '';
  return '';
}

const PROPERTY_FIELDS = `
  id title location latitude longitude price type bedrooms bathrooms areaSqft status listingFor specs aiTip aiScore createdAt updatedAt
`;

const QUERY_PROPERTIES = `
  query Properties($filter: PropertyFilterDto) {
    properties(filter: $filter) {
      ${PROPERTY_FIELDS}
    }
  }
`;

const QUERY_PROPERTY = `
  query Property($id: String!) {
    property(id: $id) {
      ${PROPERTY_FIELDS}
    }
  }
`;

const MUTATION_CREATE_PROPERTY = `
  mutation CreateProperty($input: CreatePropertyDto!) {
    createProperty(input: $input) {
      id title location price type listingFor createdAt
    }
  }
`;

const MUTATION_SEND_OTP = `
  mutation SendOtp($input: SendOtpInput!) {
    sendOtp(input: $input) {
      success
      message
    }
  }
`;

const MUTATION_VERIFY_OTP = `
  mutation VerifyOtp($input: VerifyOtpInput!) {
    verifyOtp(input: $input) {
      token
    }
  }
`;

export interface CreatePropertyInput {
  title: string;
  location: string;
  price: number;
  type?: string;
  listingFor?: string;
}

export interface PropertyFilter {
  type?: string;
  location?: string;
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  sortBy?: "createdAt" | "price" | "aiScore";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface ApiProperty {
  id: string;
  title: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number | null;
  status: string | null;
  listingFor: string | null;
  specs: string[] | null;
  aiTip: string | null;
  aiScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchProperties(filter?: PropertyFilter): Promise<ApiProperty[]> {
  const url = getGraphQLUrl();
  if (!url) return [];
  try {
    const data = await runGraphQL<{ properties: ApiProperty[] }>(url, {
      query: QUERY_PROPERTIES,
      variables: { filter: filter ?? {} },
    });
    return data.properties ?? [];
  } catch {
    return [];
  }
}

export async function fetchProperty(id: string): Promise<ApiProperty | null> {
  const url = getGraphQLUrl();
  if (!url) return null;
  try {
    const data = await runGraphQL<{ property: ApiProperty | null }>(url, {
      query: QUERY_PROPERTY,
      variables: { id },
    });
    return data.property ?? null;
  } catch {
    return null;
  }
}

export async function createProperty(
  input: CreatePropertyInput,
  headers?: Record<string, string>,
): Promise<{ id: string; title: string; location: string; price: number; type?: string; listingFor?: string; createdAt: string }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured (EXPO_PUBLIC_API_URL or EXPO_PUBLIC_GRAPHQL_HTTP)');
  const data = await runGraphQL<{ createProperty: { id: string; title: string; location: string; price: number; type?: string; listingFor?: string; createdAt: string } }>(
    url,
    { query: MUTATION_CREATE_PROPERTY, variables: { input }, headers },
  );
  return data.createProperty;
}

export async function sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ sendOtp: { success: boolean; message: string } }>(url, {
    query: MUTATION_SEND_OTP,
    variables: { input: { phone } },
  });
  return data.sendOtp;
}

export async function verifyOtp(phone: string, code: string): Promise<{ token: string }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ verifyOtp: { token: string } }>(url, {
    query: MUTATION_VERIFY_OTP,
    variables: { input: { phone, code } },
  });
  return data.verifyOtp;
}
