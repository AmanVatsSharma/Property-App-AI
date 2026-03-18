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
  id title location latitude longitude price type bedrooms bathrooms areaSqft status listingFor specs aiTip aiScore createdByUserId createdAt updatedAt
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

const MUTATION_TOGGLE_FAVORITE = `
  mutation ToggleFavorite($propertyId: String!) {
    toggleFavorite(propertyId: $propertyId) {
      saved
    }
  }
`;

const QUERY_MY_FAVORITES = `
  query MyFavorites {
    myFavorites {
      id userId propertyId createdAt
      property { id title location price type coverImageUrl }
    }
  }
`;

const MUTATION_SEND_ENQUIRY = `
  mutation SendEnquiry($input: CreateEnquiryInput!) {
    sendEnquiry(input: $input) {
      id propertyId fromUserId message status createdAt
    }
  }
`;

const MUTATION_CHANGE_PROPERTY_STATUS = `
  mutation ChangePropertyStatus($id: String!, $status: String!) {
    changePropertyStatus(id: $id, status: $status) {
      id status
    }
  }
`;

const QUERY_ME = `
  query Me {
    me { id phone displayName createdAt updatedAt }
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
  createdByUserId: string | null;
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

export async function toggleFavorite(
  propertyId: string,
  headers?: Record<string, string>,
): Promise<{ saved: boolean }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ toggleFavorite: { saved: boolean } }>(url, {
    query: MUTATION_TOGGLE_FAVORITE,
    variables: { propertyId },
    headers,
  });
  return data.toggleFavorite;
}

export interface FavoriteWithProperty {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
  property: { id: string; title: string; location: string; price: number; type: string; coverImageUrl: string | null };
}

export async function fetchMyFavorites(headers?: Record<string, string>): Promise<FavoriteWithProperty[]> {
  const url = getGraphQLUrl();
  if (!url) return [];
  try {
    const data = await runGraphQL<{ myFavorites: FavoriteWithProperty[] }>(url, {
      query: QUERY_MY_FAVORITES,
      headers,
    });
    return data.myFavorites ?? [];
  } catch {
    return [];
  }
}

export async function sendEnquiry(
  input: { propertyId: string; message: string; phone?: string },
  headers?: Record<string, string>,
): Promise<{ id: string; propertyId: string; fromUserId: string; message: string; status: string; createdAt: string }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ sendEnquiry: { id: string; propertyId: string; fromUserId: string; message: string; status: string; createdAt: string } }>(url, {
    query: MUTATION_SEND_ENQUIRY,
    variables: { input },
    headers,
  });
  return data.sendEnquiry;
}

export async function changePropertyStatus(
  id: string,
  status: string,
  headers?: Record<string, string>,
): Promise<{ id: string; status: string }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ changePropertyStatus: { id: string; status: string } }>(url, {
    query: MUTATION_CHANGE_PROPERTY_STATUS,
    variables: { id, status },
    headers,
  });
  return data.changePropertyStatus;
}

export async function getMe(headers?: Record<string, string>): Promise<{ id: string; phone: string; displayName: string | null } | null> {
  const url = getGraphQLUrl();
  if (!url) return null;
  try {
    const data = await runGraphQL<{ me: { id: string; phone: string; displayName: string | null } | null }>(url, {
      query: QUERY_ME,
      headers,
    });
    return data.me;
  } catch {
    return null;
  }
}
