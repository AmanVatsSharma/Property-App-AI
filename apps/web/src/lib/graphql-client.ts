/**
 * @file graphql-client.ts
 * @module lib
 * @description GraphQL client for Nest API (property + agent).
 * @author BharatERP
 * @created 2025-03-12
 */

import { runGraphQL } from '@property-app-ai/shared';

function getGraphQLUrl(): string {
  const fromApiUrl = (url: string | undefined) =>
    url ? url.replace(/\/$/, '') + '/graphql' : '';
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_GRAPHQL_HTTP ?? fromApiUrl(process.env.NEXT_PUBLIC_API_URL) ?? '';
  }
  return (
    process.env.NEXT_PUBLIC_GRAPHQL_HTTP ??
    process.env.API_GRAPHQL_HTTP ??
    fromApiUrl(process.env.NEXT_PUBLIC_API_URL) ??
    ''
  );
}

const PROPERTY_FIELDS = `
  id title location latitude longitude price type bedrooms bathrooms areaSqft status listingFor specs aiTip aiScore coverImageUrl imageUrls createdAt updatedAt
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

export const MUTATION_ASK_AGENT = `
  mutation AskAgent($input: AskAgentInput!) {
    askAgent(input: $input) {
      ... on AskAgentResult {
        answer
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
    me { id phone displayName createdAt updatedAt }
  }
`;

export const MUTATION_UPDATE_PROFILE = `
  mutation UpdateMyProfile($input: UpdateProfileInput!) {
    updateMyProfile(input: $input) {
      id phone displayName
    }
  }
`;

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
  coverImageUrl: string | null;
  imageUrls: string[] | null;
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
  sources: AgentSource[];
  suggestedActions: AgentSuggestedAction[];
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
  options?: { requestId?: string; headers?: Record<string, string> } | string,
): Promise<AskAgentResult> {
  const opts = typeof options === 'string' ? { requestId: options } : options;
  const url = getGraphQLUrl();
  if (!url) throw new Error('GraphQL URL not configured');
  const data = await runGraphQL<{ askAgent: AskAgentResult | { jobId: string } }>(url, {
    query: MUTATION_ASK_AGENT,
    variables: { input },
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
