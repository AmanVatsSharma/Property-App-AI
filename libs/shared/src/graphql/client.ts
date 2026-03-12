/**
 * @file client.ts
 * @module shared/graphql
 * @description Minimal GraphQL client for web and mobile (uses fetch).
 * @author BharatERP
 * @created 2025-03-12
 */

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

/**
 * Run a GraphQL operation (query or mutation) against the given endpoint.
 * Uses global fetch (browser / React Native / Node 18+).
 */
export async function runGraphQL<T = unknown>(
  url: string,
  options: {
    query: string;
    variables?: Record<string, unknown>;
    headers?: Record<string, string>;
    requestId?: string;
  }
): Promise<T> {
  const { query, variables, headers = {}, requestId } = options;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': requestId ?? `gql_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GraphQL HTTP ${res.status}: ${text}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    const msg = json.errors.map((e) => e.message).join('; ');
    throw new Error(`GraphQL errors: ${msg}`);
  }

  if (json.data == null) {
    throw new Error('GraphQL response missing data');
  }

  return json.data as T;
}
