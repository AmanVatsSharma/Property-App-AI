/**
 * @file graphql-client.ts
 * @module lib
 * @description GraphQL client for Nest API (property + agent).
 * @author BharatERP
 * @created 2025-03-12
 */

import { runGraphQL } from '@property-app-ai/shared';

/** Builds GraphQL endpoint from API base URL. Use when NEXT_PUBLIC_GRAPHQL_HTTP is unset and NEXT_PUBLIC_API_URL is set. */
export function fromApiUrl(url: string | undefined): string {
  return url ? url.replace(/\/$/, '') + '/graphql' : '';
}

/** Use same-origin /graphql (Next rewrite) in the browser when the target is local Nest — satisfies CSP and avoids CORS. */
function browserGraphqlUrl(resolved: string): string {
  if (typeof window === 'undefined') return resolved;
  if (!resolved) return '/graphql';
  try {
    const u = new URL(resolved);
    const isLocalNest =
      (u.hostname === 'localhost' || u.hostname === '127.0.0.1') && u.port === '3333';
    if (isLocalNest) return '/graphql';
  } catch {
    /* keep resolved */
  }
  return resolved;
}

function getGraphQLUrl(): string {
  if (typeof window !== 'undefined') {
    const resolved =
      process.env.NEXT_PUBLIC_GRAPHQL_HTTP ?? fromApiUrl(process.env.NEXT_PUBLIC_API_URL) ?? '';
    return browserGraphqlUrl(resolved);
  }
  return (
    process.env.NEXT_PUBLIC_GRAPHQL_HTTP ??
    process.env.API_GRAPHQL_HTTP ??
    fromApiUrl(process.env.NEXT_PUBLIC_API_URL) ??
    ''
  );
}

const PROPERTY_FIELDS = `
  id title location areaId locality city latitude longitude price type bedrooms bathrooms areaSqft status listingFor specs aiTip aiScore coverImageUrl imageUrls nearbyAmenities createdByUserId isFreeListing viewCount createdAt updatedAt
`;

export const QUERY_PROPERTIES = `
  query Properties($filter: PropertyFilterDto) {
    properties(filter: $filter) {
      ${PROPERTY_FIELDS}
    }
  }
`;

export const QUERY_SEARCH_BY_QUERY = `
  query SearchPropertiesByQuery($query: String!) {
    searchPropertiesByQuery(query: $query) {
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

export const MUTATION_ASK_AGENT = `
  mutation AskAgent($input: AskAgentInput!, $conversationId: String) {
    askAgent(input: $input, conversationId: $conversationId) {
      ... on AskAgentResult {
        answer
        conversationId
        sources { type label id }
        suggestedActions { label target }
      }
      ... on AskAgentAsyncResult {
        jobId
      }
    }
  }
`;

export const MUTATION_SCORE_PROPERTY = `
  mutation ScoreProperty($propertyId: String!) {
    scoreProperty(propertyId: $propertyId) {
      id aiScore aiTip
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

export const MUTATION_SEND_OTP = `
  mutation SendOtp($input: SendOtpInput!) {
    sendOtp(input: $input) {
      success
      message
    }
  }
`;

export const MUTATION_VERIFY_OTP = `
  mutation VerifyOtp($input: VerifyOtpInput!) {
    verifyOtp(input: $input) {
      token
      user { id phone displayName }
    }
  }
`;

export const QUERY_ME = `
  query Me {
    me { id phone displayName role createdAt updatedAt }
  }
`;

export const MUTATION_UPDATE_PROFILE = `
  mutation UpdateMyProfile($input: UpdateProfileInput!) {
    updateMyProfile(input: $input) {
      id phone displayName
    }
  }
`;

export const MUTATION_TOGGLE_FAVORITE = `
  mutation ToggleFavorite($propertyId: String!) {
    toggleFavorite(propertyId: $propertyId) {
      saved
    }
  }
`;

export const QUERY_MY_FAVORITES = `
  query MyFavorites {
    myFavorites {
      id
      userId
      propertyId
      createdAt
      property { id title location price type coverImageUrl }
    }
  }
`;

export const MUTATION_SEND_ENQUIRY = `
  mutation SendEnquiry($input: CreateEnquiryInput!) {
    sendEnquiry(input: $input) {
      id
      propertyId
      fromUserId
      message
      status
      createdAt
    }
  }
`;

export const QUERY_MY_RECEIVED_ENQUIRIES = `
  query MyReceivedEnquiries {
    myReceivedEnquiries {
      id propertyId fromUserId ownerUserId message phone status createdAt updatedAt
    }
  }
`;

export const QUERY_MY_SENT_ENQUIRIES = `
  query MySentEnquiries {
    mySentEnquiries {
      id propertyId fromUserId ownerUserId message phone status createdAt updatedAt
    }
  }
`;

export const MUTATION_CHANGE_PROPERTY_STATUS = `
  mutation ChangePropertyStatus($id: String!, $status: String!) {
    changePropertyStatus(id: $id, status: $status) {
      id status
    }
  }
`;

export const QUERY_MY_SAVED_SEARCHES = `
  query MySavedSearches {
    mySavedSearches {
      id name filters alertEnabled lastAlertSentAt createdAt updatedAt
    }
  }
`;

export const MUTATION_CREATE_SAVED_SEARCH = `
  mutation CreateSavedSearch($input: CreateSavedSearchInput!) {
    createSavedSearch(input: $input) {
      id name filters alertEnabled createdAt
    }
  }
`;

export const MUTATION_UPDATE_SAVED_SEARCH = `
  mutation UpdateSavedSearch($id: String!, $input: UpdateSavedSearchInput!) {
    updateSavedSearch(id: $id, input: $input) {
      id name filters alertEnabled updatedAt
    }
  }
`;

export const MUTATION_DELETE_SAVED_SEARCH = `
  mutation DeleteSavedSearch($id: String!) {
    deleteSavedSearch(id: $id)
  }
`;

export interface SavedSearchItem {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  alertEnabled: boolean;
  lastAlertSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const QUERY_MY_NOTIFICATIONS = `
  query MyNotifications($limit: Int, $offset: Int) {
    myNotifications(limit: $limit, offset: $offset) {
      id type title body data readAt createdAt
    }
  }
`;

export const MUTATION_MARK_ALL_NOTIFICATIONS_READ = `
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
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

export const QUERY_AGENT_JOB_STATUS = `
  query AgentJobStatus($jobId: String!) {
    agentJobStatus(jobId: $jobId) {
      status
      result { answer sources { type label id } suggestedActions { label target } }
    }
  }
`;

/** Matches API PropertyFilterDto (property-filter.dto.ts). */
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
  sortOrder?: "asc" | "desc" | "ASC" | "DESC";
  limit?: number;
  offset?: number;
}

/** Matches API Property entity (GraphQL ObjectType). */
export interface ApiProperty {
  id: string;
  title: string;
  location: string;
  areaId?: string | null;
  locality?: string | null;
  city?: string | null;
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
  coverImageUrl: string | null;
  imageUrls: string[] | null;
  nearbyAmenities?: string[] | null;
  createdByUserId: string | null;
  isFreeListing: boolean;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessageInput {
  role: 'user' | 'assistant';
  content: string;
}

export interface AskAgentInput {
  prompt: string;
  context?: { propertyId?: string; locality?: string; city?: string };
  conversationHistory?: ConversationMessageInput[];
}

export interface AgentSource {
  type: string;
  label: string;
  id?: string;
}

export interface AgentSuggestedAction {
  label: string;
  target?: string;
}

export interface AskAgentResult {
  answer: string;
  conversationId?: string;
  sources: AgentSource[];
  suggestedActions: AgentSuggestedAction[];
}

export interface FavoriteWithProperty {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
  property: { id: string; title: string; location: string; price: number; type: string; coverImageUrl: string | null };
}

export interface EnquiryItem {
  id: string;
  propertyId: string;
  fromUserId: string;
  ownerUserId: string | null;
  message: string;
  phone: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function gqlProperties(filter?: PropertyFilter): Promise<ApiProperty[]> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured (NEXT_PUBLIC_GRAPHQL_HTTP or NEXT_PUBLIC_API_URL)');
  const data = await runGraphQL<{ properties: ApiProperty[] }>(url, {
    query: QUERY_PROPERTIES,
    variables: { filter: filter ?? {} },
  });
  return data.properties ?? [];
}

/** One-shot NL search: parses query (e.g. "3 BHK near school near metro in Bangalore") and returns matching properties. */
export async function gqlSearchPropertiesByQuery(query: string): Promise<ApiProperty[]> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ searchPropertiesByQuery: ApiProperty[] }>(url, {
    query: QUERY_SEARCH_BY_QUERY,
    variables: { query: query.trim() },
  });
  return data.searchPropertiesByQuery ?? [];
}

export async function gqlProperty(id: string): Promise<ApiProperty | null> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ property: ApiProperty | null }>(url, {
    query: QUERY_PROPERTY,
    variables: { id },
  });
  return data.property ?? null;
}

export async function gqlAgentJobStatus(jobId: string): Promise<{ status: string; result?: AskAgentResult }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ agentJobStatus: { status: string; result?: AskAgentResult } }>(url, {
    query: QUERY_AGENT_JOB_STATUS,
    variables: { jobId },
  });
  return data.agentJobStatus;
}

export async function gqlAskAgent(
  input: AskAgentInput,
  options?: { requestId?: string; headers?: Record<string, string>; conversationId?: string } | string,
): Promise<AskAgentResult> {
  const opts = typeof options === 'string' ? { requestId: options } : options;
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ askAgent: AskAgentResult | { jobId: string } }>(url, {
    query: MUTATION_ASK_AGENT,
    variables: { input, conversationId: opts?.conversationId ?? undefined },
    requestId: opts?.requestId,
    headers: opts?.headers,
  });
  const raw = data.askAgent;
  if (raw && 'jobId' in raw) {
    const jobId = raw.jobId;
    const maxAttempts = 60;
    const intervalMs = 2000;
    for (let i = 0; i < maxAttempts; i++) {
      const { status, result } = await gqlAgentJobStatus(jobId);
      if (status === 'completed' && result) return result;
      if (status === 'failed' || status === 'not_found') throw new Error(`Agent job ${status}`);
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error('Agent job timed out');
  }
  return raw as AskAgentResult;
}

export async function gqlScoreProperty(propertyId: string): Promise<{ id: string; aiScore: number | null; aiTip: string | null }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ scoreProperty: { id: string; aiScore: number | null; aiTip: string | null } }>(url, {
    query: MUTATION_SCORE_PROPERTY,
    variables: { propertyId },
  });
  return data.scoreProperty;
}

export async function gqlCreateProperty(
  input: CreatePropertyInput,
  headers?: Record<string, string>,
): Promise<{ id: string; title: string; location: string; price: number; type?: string; listingFor?: string; coverImageUrl?: string | null; imageUrls?: string[] | null; createdAt: string }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ createProperty: { id: string; title: string; location: string; price: number; type?: string; listingFor?: string; coverImageUrl?: string | null; imageUrls?: string[] | null; createdAt: string } }>(
    url,
    { query: MUTATION_CREATE_PROPERTY, variables: { input }, headers },
  );
  return data.createProperty;
}

export async function gqlSendOtp(phone: string): Promise<{ success: boolean; message: string }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ sendOtp: { success: boolean; message: string } }>(url, {
    query: MUTATION_SEND_OTP,
    variables: { input: { phone } },
  });
  return data.sendOtp;
}

export interface AuthUser {
  id: string;
  phone: string;
  displayName: string | null;
  role?: string;
}

export async function gqlVerifyOtp(phone: string, code: string): Promise<{ token: string; user: AuthUser }> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ verifyOtp: { token: string; user: AuthUser } }>(url, {
    query: MUTATION_VERIFY_OTP,
    variables: { input: { phone, code } },
  });
  return data.verifyOtp;
}

export async function gqlMe(headers?: Record<string, string>): Promise<AuthUser | null> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ me: AuthUser | null }>(url, {
    query: QUERY_ME,
    headers,
  });
  return data.me;
}

export async function gqlUpdateProfile(
  input: { displayName?: string | null },
  headers?: Record<string, string>,
): Promise<AuthUser> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ updateMyProfile: AuthUser }>(url, {
    query: MUTATION_UPDATE_PROFILE,
    variables: { input },
    headers,
  });
  return data.updateMyProfile;
}

export async function gqlToggleFavorite(
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

export async function gqlMyFavorites(headers?: Record<string, string>): Promise<FavoriteWithProperty[]> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ myFavorites: FavoriteWithProperty[] }>(url, {
    query: QUERY_MY_FAVORITES,
    headers,
  });
  return data.myFavorites ?? [];
}

export async function gqlSendEnquiry(
  input: { propertyId: string; message: string; phone?: string },
  headers?: Record<string, string>,
): Promise<EnquiryItem> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ sendEnquiry: EnquiryItem }>(url, {
    query: MUTATION_SEND_ENQUIRY,
    variables: { input },
    headers,
  });
  return data.sendEnquiry;
}

export async function gqlMyReceivedEnquiries(headers?: Record<string, string>): Promise<EnquiryItem[]> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ myReceivedEnquiries: EnquiryItem[] }>(url, {
    query: QUERY_MY_RECEIVED_ENQUIRIES,
    headers,
  });
  return data.myReceivedEnquiries ?? [];
}

export async function gqlMySentEnquiries(headers?: Record<string, string>): Promise<EnquiryItem[]> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ mySentEnquiries: EnquiryItem[] }>(url, {
    query: QUERY_MY_SENT_ENQUIRIES,
    headers,
  });
  return data.mySentEnquiries ?? [];
}

export async function gqlChangePropertyStatus(
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

export async function gqlMySavedSearches(
  headers?: Record<string, string>,
): Promise<SavedSearchItem[]> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ mySavedSearches: SavedSearchItem[] }>(url, {
    query: QUERY_MY_SAVED_SEARCHES,
    headers,
  });
  return data.mySavedSearches ?? [];
}

export async function gqlCreateSavedSearch(
  input: { name: string; filters: Record<string, unknown>; alertEnabled?: boolean },
  headers?: Record<string, string>,
): Promise<SavedSearchItem> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ createSavedSearch: SavedSearchItem }>(url, {
    query: MUTATION_CREATE_SAVED_SEARCH,
    variables: { input },
    headers,
  });
  return data.createSavedSearch;
}

export async function gqlUpdateSavedSearch(
  id: string,
  input: { name?: string; filters?: Record<string, unknown>; alertEnabled?: boolean },
  headers?: Record<string, string>,
): Promise<SavedSearchItem> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ updateSavedSearch: SavedSearchItem }>(url, {
    query: MUTATION_UPDATE_SAVED_SEARCH,
    variables: { id, input },
    headers,
  });
  return data.updateSavedSearch;
}

export async function gqlDeleteSavedSearch(
  id: string,
  headers?: Record<string, string>,
): Promise<boolean> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ deleteSavedSearch: boolean }>(url, {
    query: MUTATION_DELETE_SAVED_SEARCH,
    variables: { id },
    headers,
  });
  return data.deleteSavedSearch;
}

export async function gqlMyNotifications(
  headers?: Record<string, string>,
  limit = 20,
  offset = 0,
): Promise<NotificationItem[]> {
  const url = getGraphQLUrl();
  if (!url) return [];
  const data = await runGraphQL<{ myNotifications: NotificationItem[] }>(url, {
    query: QUERY_MY_NOTIFICATIONS,
    variables: { limit, offset },
    headers,
  });
  return data.myNotifications ?? [];
}

export async function gqlMarkAllNotificationsRead(
  headers?: Record<string, string>,
): Promise<boolean> {
  const url = getGraphQLUrl();
  if (!url) return false;
  const data = await runGraphQL<{ markAllNotificationsRead: boolean }>(url, {
    query: MUTATION_MARK_ALL_NOTIFICATIONS_READ,
    headers,
  });
  return data.markAllNotificationsRead ?? false;
}

export const QUERY_MY_LISTINGS = `
  query MyListings($limit: Int, $offset: Int) {
    myListings(limit: $limit, offset: $offset) {
      ${PROPERTY_FIELDS}
    }
  }
`;

export async function gqlMyListings(
  headers?: Record<string, string>,
  limit = 50,
  offset = 0,
): Promise<ApiProperty[]> {
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ myListings: ApiProperty[] }>(url, {
    query: QUERY_MY_LISTINGS,
    variables: { limit, offset },
    headers,
  });
  return data.myListings ?? [];
}
