/**
 * @file graphql-client.ts
 * @module admin/lib
 * @description GraphQL client for admin panel; uses shared runGraphQL with optional Bearer token.
 * @author BharatERP
 * @created 2025-03-13
 */

import { runGraphQL } from "@property-app-ai/shared";

function getGraphQLUrl(): string {
  if (typeof window !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_GRAPHQL_HTTP ??
      (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") + "/graphql") ??
      ""
    );
  }
  return (
    process.env.NEXT_PUBLIC_GRAPHQL_HTTP ??
    process.env.API_GRAPHQL_HTTP ??
    (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") + "/graphql") ??
    ""
  );
}

function getHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

const PROPERTY_FIELDS = `
  id title location latitude longitude price type bedrooms bathrooms areaSqft status listingFor specs aiTip aiScore coverImageUrl imageUrls createdByUserId createdAt updatedAt
`;

export const QUERY_ME = `
  query Me {
    me { id phone displayName role createdAt updatedAt }
  }
`;

export const QUERY_PROPERTIES = `
  query Properties($filter: PropertyFilterDto) {
    properties(filter: $filter) {
      ${PROPERTY_FIELDS}
    }
  }
`;

export const QUERY_PROPERTY = `
  query Property($id: String!) {
    property(id: $id) {
      ${PROPERTY_FIELDS}
    }
  }
`;

export const QUERY_ADMIN_STATS = `
  query AdminStats {
    adminStats { propertyCount userCount }
  }
`;

export const QUERY_USERS = `
  query Users($limit: Int, $offset: Int) {
    users(limit: $limit, offset: $offset) {
      users { id phone displayName role createdAt updatedAt }
      total
    }
  }
`;

export const MUTATION_SEND_OTP = `
  mutation SendOtp($input: SendOtpInput!) {
    sendOtp(input: $input) { success message }
  }
`;

export const MUTATION_VERIFY_OTP = `
  mutation VerifyOtp($input: VerifyOtpInput!) {
    verifyOtp(input: $input) {
      token
      user { id phone displayName role }
    }
  }
`;

export const MUTATION_CREATE_PROPERTY = `
  mutation CreateProperty($input: CreatePropertyDto!) {
    createProperty(input: $input) {
      id title location price type bedrooms bathrooms areaSqft status listingFor coverImageUrl imageUrls createdAt
    }
  }
`;

export const MUTATION_UPDATE_PROPERTY = `
  mutation UpdateProperty($id: String!, $input: UpdatePropertyDto!) {
    updateProperty(id: $id, input: $input) {
      id title location price type bedrooms bathrooms areaSqft status listingFor coverImageUrl imageUrls updatedAt
    }
  }
`;

export const MUTATION_DELETE_PROPERTY = `
  mutation DeleteProperty($id: String!) {
    deleteProperty(id: $id)
  }
`;

export interface AdminUser {
  id: string;
  phone: string;
  displayName: string | null;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiProperty {
  id: string;
  title: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  areaSqft?: number | null;
  status?: string | null;
  listingFor?: string | null;
  specs?: string[] | null;
  aiTip?: string | null;
  aiScore?: number | null;
  coverImageUrl?: string | null;
  imageUrls?: string[] | null;
  createdByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilter {
  type?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export async function gqlMe(token: string | null): Promise<AdminUser | null> {
  const url = getGraphQLUrl();
  if (!url) throw new Error("GraphQL URL not configured");
  const data = await runGraphQL<{ me: AdminUser | null }>(url, {
    query: QUERY_ME,
    headers: getHeaders(token),
  });
  return data.me ?? null;
}

export async function gqlProperties(
  filter?: PropertyFilter,
  token?: string | null
): Promise<ApiProperty[]> {
  const url = getGraphQLUrl();
  if (!url) throw new Error("GraphQL URL not configured");
  const data = await runGraphQL<{ properties: ApiProperty[] }>(url, {
    query: QUERY_PROPERTIES,
    variables: { filter: filter ?? {} },
    headers: getHeaders(token ?? null),
  });
  return data.properties ?? [];
}

export async function gqlProperty(
  id: string,
  token?: string | null
): Promise<ApiProperty | null> {
  const url = getGraphQLUrl();
  if (!url) throw new Error("GraphQL URL not configured");
  const data = await runGraphQL<{ property: ApiProperty | null }>(url, {
    query: QUERY_PROPERTY,
    variables: { id },
    headers: getHeaders(token ?? null),
  });
  return data.property ?? null;
}

export async function gqlAdminStats(
  token: string | null
): Promise<{ propertyCount: number; userCount: number }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error("GraphQL URL not configured");
  const data = await runGraphQL<{
    adminStats: { propertyCount: number; userCount: number };
  }>(url, {
    query: QUERY_ADMIN_STATS,
    headers: getHeaders(token),
  });
  return data.adminStats;
}

export async function gqlUsers(
  token: string | null,
  limit = 20,
  offset = 0
): Promise<{ users: AdminUser[]; total: number }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error("GraphQL URL not configured");
  const data = await runGraphQL<{
    users: { users: AdminUser[]; total: number };
  }>(url, {
    query: QUERY_USERS,
    variables: { limit, offset },
    headers: getHeaders(token),
  });
  return data.users;
}

export async function gqlSendOtp(phone: string): Promise<{ success: boolean; message: string }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error("GraphQL URL not configured");
  const data = await runGraphQL<{ sendOtp: { success: boolean; message: string } }>(url, {
    query: MUTATION_SEND_OTP,
    variables: { input: { phone } },
  });
  return data.sendOtp;
}

export async function gqlVerifyOtp(
  phone: string,
  code: string
): Promise<{ token: string; user: AdminUser }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error("GraphQL URL not configured");
  const data = await runGraphQL<{
    verifyOtp: { token: string; user: AdminUser };
  }>(url, {
    query: MUTATION_VERIFY_OTP,
    variables: { input: { phone, code } },
  });
  return data.verifyOtp;
}

export interface CreatePropertyInput {
  title: string;
  location: string;
  price: number;
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  status?: string;
  listingFor?: string;
  specs?: string[];
  coverImageUrl?: string;
  imageUrls?: string[];
}

export async function gqlCreateProperty(
  input: CreatePropertyInput,
  token: string | null
): Promise<ApiProperty> {
  const url = getGraphQLUrl();
  if (!url) throw new Error("GraphQL URL not configured");
  const data = await runGraphQL<{ createProperty: ApiProperty }>(url, {
    query: MUTATION_CREATE_PROPERTY,
    variables: { input },
    headers: getHeaders(token),
  });
  return data.createProperty;
}

export interface UpdatePropertyInput {
  title?: string;
  location?: string;
  price?: number;
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  status?: string;
  listingFor?: string;
  specs?: string[];
  coverImageUrl?: string;
  imageUrls?: string[];
}

export async function gqlUpdateProperty(
  id: string,
  input: UpdatePropertyInput,
  token: string | null
): Promise<ApiProperty> {
  const url = getGraphQLUrl();
  if (!url) throw new Error("GraphQL URL not configured");
  const data = await runGraphQL<{ updateProperty: ApiProperty }>(url, {
    query: MUTATION_UPDATE_PROPERTY,
    variables: { id, input },
    headers: getHeaders(token),
  });
  return data.updateProperty;
}

export async function gqlDeleteProperty(
  id: string,
  token: string | null
): Promise<boolean> {
  const url = getGraphQLUrl();
  if (!url) throw new Error("GraphQL URL not configured");
  const data = await runGraphQL<{ deleteProperty: boolean }>(url, {
    query: MUTATION_DELETE_PROPERTY,
    variables: { id },
    headers: getHeaders(token),
  });
  return data.deleteProperty;
}
