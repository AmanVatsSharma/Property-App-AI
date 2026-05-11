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
  if (!base) {
    // Both EXPO_PUBLIC_API_URL and EXPO_PUBLIC_GRAPHQL_HTTP are unset.
    // All GraphQL calls will silently no-op. Set at least EXPO_PUBLIC_API_URL in .env.
    if (__DEV__) {
      console.warn('[GraphQL] EXPO_PUBLIC_API_URL is not set. GraphQL calls will fail.');
    }
    return '';
  }
  if (!base.startsWith('http')) {
    // URL is set but missing the protocol — e.g. "localhost:3333" instead of "http://localhost:3333".
    const msg = `[GraphQL] EXPO_PUBLIC_API_URL must start with "http" or "https". Got: "${base}"`;
    if (__DEV__) {
      console.warn(msg);
    }
    return '';
  }
  const cleaned = base.replace(/\/$/, '');
  return cleaned.includes('graphql') ? cleaned : `${cleaned}/graphql`;
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

const QUERY_SEARCH_BY_QUERY = `
  query SearchPropertiesByQuery($query: String!) {
    searchPropertiesByQuery(query: $query) {
      ${PROPERTY_FIELDS}
    }
  }
`;

const QUERY_ME = `
  query Me {
    me { id phone displayName createdAt updatedAt }
  }
`;

const QUERY_MY_SAVED_SEARCHES = `
  query MySavedSearches {
    mySavedSearches {
      id userId name filtersJson alertEnabled createdAt updatedAt
    }
  }
`;

const MUTATION_UPDATE_SAVED_SEARCH = `
  mutation UpdateSavedSearch($id: String!, $input: UpdateSavedSearchInput!) {
    updateSavedSearch(id: $id, input: $input) {
      id name alertEnabled
    }
  }
`;

const MUTATION_DELETE_SAVED_SEARCH = `
  mutation DeleteSavedSearch($id: String!) {
    deleteSavedSearch(id: $id) {
      success
    }
  }
`;

const QUERY_MY_LISTINGS = `
  query MyListings {
    myListings {
      id title location price type status bedrooms bathrooms areaSqft aiScore createdAt
    }
  }
`;

const QUERY_MY_RECEIVED_ENQUIRIES = `
  query MyReceivedEnquiries {
    myReceivedEnquiries {
      id propertyId fromUserId message status createdAt
      property { id title location price }
      enquirer { id displayName phone }
    }
  }
`;

const MUTATION_UPDATE_PROFILE = `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id displayName
    }
  }
`;

const MUTATION_ASK_AGENT = `
  mutation AskAgent($input: AskAgentInput!) {
    askAgent(input: $input) {
      answer sources { id title type }
      suggestedActions { label action }
    }
  }
`;

const MUTATION_CREATE_SAVED_SEARCH = `
  mutation CreateSavedSearch($input: CreateSavedSearchInput!) {
    createSavedSearch(input: $input) {
      id name alertEnabled
    }
  }
`;

const QUERY_NEIGHBOURHOOD_SCORE = `
  query NeighbourhoodScore($locality: String!, $city: String!) {
    neighbourhoodScore(locality: $locality, city: $city) {
      locality city overallScore livability connectivity schools safety
    }
  }
`;

const QUERY_PRICE_FORECAST = `
  query PriceForecast($locality: String!, $city: String!, $propertyType: String!) {
    priceForecast(locality: $locality, city: $city, propertyType: $propertyType) {
      locality city propertyType currentPrice forecast12m forecast24m forecast36m
      demandSignal confidenceLevel lastUpdated
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

export async function searchPropertiesByQuery(query: string): Promise<ApiProperty[]> {
  const url = getGraphQLUrl();
  if (!url) return [];
  try {
    const data = await runGraphQL<{ searchPropertiesByQuery: ApiProperty[] }>(url, {
      query: QUERY_SEARCH_BY_QUERY,
      variables: { query },
    });
    return data.searchPropertiesByQuery ?? [];
  } catch {
    return [];
  }
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

/* ── Saved Searches ──────────────────────────────────────────────── */

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filtersJson: string;
  alertEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchMySavedSearches(headers?: Record<string, string>): Promise<SavedSearch[]> {
  const url = getGraphQLUrl();
  if (!url) return [];
  try {
    const data = await runGraphQL<{ mySavedSearches: SavedSearch[] }>(url, {
      query: QUERY_MY_SAVED_SEARCHES,
      headers,
    });
    return data.mySavedSearches ?? [];
  } catch {
    return [];
  }
}

export async function updateSavedSearch(
  id: string,
  input: { name?: string; alertEnabled?: boolean },
  headers?: Record<string, string>,
): Promise<{ id: string; name: string; alertEnabled: boolean }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ updateSavedSearch: { id: string; name: string; alertEnabled: boolean } }>(url, {
    query: MUTATION_UPDATE_SAVED_SEARCH,
    variables: { id, input },
    headers,
  });
  return data.updateSavedSearch;
}

export async function deleteSavedSearch(id: string, headers?: Record<string, string>): Promise<boolean> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  try {
    const data = await runGraphQL<{ deleteSavedSearch: { success: boolean } }>(url, {
      query: MUTATION_DELETE_SAVED_SEARCH,
      variables: { id },
      headers,
    });
    return data.deleteSavedSearch?.success ?? false;
  } catch {
    return false;
  }
}

export async function createSavedSearch(
  input: { name: string; filtersJson: string; alertEnabled?: boolean },
  headers?: Record<string, string>,
): Promise<{ id: string; name: string; alertEnabled: boolean }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ createSavedSearch: { id: string; name: string; alertEnabled: boolean } }>(url, {
    query: MUTATION_CREATE_SAVED_SEARCH,
    variables: { input },
    headers,
  });
  return data.createSavedSearch;
}

/* ── My Listings (broker) ───────────────────────────────────────── */

export interface BrokerListing {
  id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  status: string | null;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number | null;
  aiScore: number | null;
  createdAt: string;
}

export async function fetchMyListings(headers?: Record<string, string>): Promise<BrokerListing[]> {
  const url = getGraphQLUrl();
  if (!url) return [];
  try {
    const data = await runGraphQL<{ myListings: BrokerListing[] }>(url, {
      query: QUERY_MY_LISTINGS,
      headers,
    });
    return data.myListings ?? [];
  } catch {
    return [];
  }
}

/* ── Received Enquiries (broker) ─────────────────────────────────── */

export interface ReceivedEnquiry {
  id: string;
  propertyId: string;
  fromUserId: string;
  message: string;
  status: string | null;
  createdAt: string;
  property: { id: string; title: string; location: string; price: number };
  enquirer: { id: string; displayName: string | null; phone: string };
}

export async function fetchMyReceivedEnquiries(headers?: Record<string, string>): Promise<ReceivedEnquiry[]> {
  const url = getGraphQLUrl();
  if (!url) return [];
  try {
    const data = await runGraphQL<{ myReceivedEnquiries: ReceivedEnquiry[] }>(url, {
      query: QUERY_MY_RECEIVED_ENQUIRIES,
      headers,
    });
    return data.myReceivedEnquiries ?? [];
  } catch {
    return [];
  }
}

/* ── Profile ────────────────────────────────────────────────────── */

export async function updateProfile(
  input: { displayName?: string },
  headers?: Record<string, string>,
): Promise<{ id: string; displayName: string }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ updateProfile: { id: string; displayName: string } }>(url, {
    query: MUTATION_UPDATE_PROFILE,
    variables: { input },
    headers,
  });
  return data.updateProfile;
}

/* ── AI Agent ───────────────────────────────────────────────────── */

export interface AskAgentResult {
  answer: string;
  sources: { id: string; title: string; type: string }[];
  suggestedActions: { label: string; action: string }[];
}

export async function askAgent(
  input: { question: string; context?: string },
  headers?: Record<string, string>,
): Promise<AskAgentResult | null> {
  const url = getGraphQLUrl();
  if (!url) return null;
  try {
    const data = await runGraphQL<{ askAgent: AskAgentResult }>(url, {
      query: MUTATION_ASK_AGENT,
      variables: { input },
      headers,
    });
    return data.askAgent;
  } catch {
    return null;
  }
}

/* ── Neighbourhood Score (REST) ──────────────────────────────────── */

function getRestUrl(): string {
  const base = process.env.EXPO_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '';
  if (!base.startsWith('http')) return '';
  return base.replace(/\/$/, '');
}

export interface NeighbourhoodScoreData {
  locality: string;
  city: string;
  overallScore: number;
  livability: number;
  connectivity: number;
  schools: number;
  safety: number;
}

export async function fetchNeighbourhoodScore(
  locality: string,
  city: string,
): Promise<NeighbourhoodScoreData | null> {
  const base = getRestUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/v1/neighbourhood?locality=${encodeURIComponent(locality)}&city=${encodeURIComponent(city)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data as NeighbourhoodScoreData;
  } catch {
    return null;
  }
}

/* ── Price Forecast (REST) ──────────────────────────────────────── */

export interface PriceForecastData {
  locality: string;
  city: string;
  propertyType: string;
  currentPrice: number;
  forecast12m: number;
  forecast24m: number;
  forecast36m: number;
  demandSignal: string;
  confidenceLevel: string;
  lastUpdated: string;
}

export async function fetchPriceForecast(
  locality: string,
  city: string,
  propertyType: string = 'apartment',
): Promise<PriceForecastData | null> {
  const base = getRestUrl();
  if (!base) return null;
  try {
    const res = await fetch(
      `${base}/api/v1/price-forecast?locality=${encodeURIComponent(locality)}&city=${encodeURIComponent(city)}&propertyType=${encodeURIComponent(propertyType)}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data as PriceForecastData;
  } catch {
    return null;
  }
}

/* ── Neighbourhood Score (GraphQL) ───────────────────────────────── */

export async function fetchNeighbourhoodScoreGQL(
  locality: string,
  city: string,
  headers?: Record<string, string>,
): Promise<NeighbourhoodScoreData | null> {
  const url = getGraphQLUrl();
  if (!url) return null;
  try {
    const data = await runGraphQL<{ neighbourhoodScore: NeighbourhoodScoreData | null }>(url, {
      query: QUERY_NEIGHBOURHOOD_SCORE,
      variables: { locality, city },
      headers,
    });
    return data.neighbourhoodScore;
  } catch {
    return null;
  }
}

/* ── Price Forecast (GraphQL) ───────────────────────────────────── */

export async function fetchPriceForecastGQL(
  locality: string,
  city: string,
  propertyType: string = 'apartment',
  headers?: Record<string, string>,
): Promise<PriceForecastData | null> {
  const url = getGraphQLUrl();
  if (!url) return null;
  try {
    const data = await runGraphQL<{ priceForecast: PriceForecastData | null }>(url, {
      query: QUERY_PRICE_FORECAST,
      variables: { locality, city, propertyType },
      headers,
    });
    return data.priceForecast;
  } catch {
    return null;
  }
}
