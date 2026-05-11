/**
 * @file create-agent-chat-model.spec.ts
 * @module shared/llm
 * @description Unit tests for tryCreateAgentChatModel.
 * @author BharatERP
 * @created 2026-03-28
 */

import type { ConfigService } from '@nestjs/config';
import { tryCreateAgentChatModel } from '../create-agent-chat-model';
import { AGENT_CONFIG_KEYS } from '@api/modules/agent/config/agent-config';

function mockConfig(entries: Record<string, string | undefined>): ConfigService {
  return {
    get: jest.fn((key: string) => entries[key]),
  } as unknown as ConfigService;
}

describe('tryCreateAgentChatModel', () => {
  it('returns null when provider is google and GOOGLE_API_KEY is empty', () => {
    const config = mockConfig({
      [AGENT_CONFIG_KEYS.AGENT_PROVIDER]: 'google',
      [AGENT_CONFIG_KEYS.GOOGLE_API_KEY]: '',
      [AGENT_CONFIG_KEYS.AGENT_GOOGLE_MODEL]: 'gemini-2.0-flash',
    });
    expect(tryCreateAgentChatModel(config, { temperature: 0.2 })).toBeNull();
  });

  it('returns LLM when provider is google and GOOGLE_API_KEY is set', () => {
    const config = mockConfig({
      [AGENT_CONFIG_KEYS.AGENT_PROVIDER]: 'google',
      [AGENT_CONFIG_KEYS.GOOGLE_API_KEY]: 'test-key',
      [AGENT_CONFIG_KEYS.AGENT_GOOGLE_MODEL]: 'gemini-2.0-flash',
    });
    const created = tryCreateAgentChatModel(config, { temperature: 0.1 });
    expect(created).not.toBeNull();
    expect(created?.provider).toBe('google');
    expect(created?.llm).toBeDefined();
  });

  it('defaults provider to google when AGENT_PROVIDER is unset', () => {
    const config = mockConfig({
      [AGENT_CONFIG_KEYS.GOOGLE_API_KEY]: '',
    });
    expect(tryCreateAgentChatModel(config, { temperature: 0.2 })).toBeNull();
  });
});
