/**
 * @file create-agent-chat-model.ts
 * @module shared/llm
 * @description Builds LangChain chat models from AGENT_PROVIDER env (OpenAI, Claude, Google Gemini).
 * @author BharatERP
 * @created 2026-03-28
 */

import type { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import {
  AGENT_CONFIG_KEYS,
  type AgentProvider,
} from '@api/modules/agent/config/agent-config';

export interface AgentChatModelInvokeOptions {
  temperature: number;
  /** Maps to maxTokens (OpenAI/Anthropic) or maxOutputTokens (Google). */
  maxOutputTokens?: number;
}

/**
 * Returns a chat model for the configured AGENT_PROVIDER when the matching API key is set; otherwise null.
 */
export function tryCreateAgentChatModel(
  config: ConfigService,
  options: AgentChatModelInvokeOptions,
): { llm: BaseChatModel; provider: AgentProvider } | null {
  const provider =
    config.get<AgentProvider>(AGENT_CONFIG_KEYS.AGENT_PROVIDER) ?? 'google';

  if (provider === 'anthropic') {
    const apiKey = config.get<string>(AGENT_CONFIG_KEYS.ANTHROPIC_API_KEY);
    if (!apiKey?.trim()) {
      return null;
    }
    const model =
      config.get<string>(AGENT_CONFIG_KEYS.AGENT_ANTHROPIC_MODEL) ??
      'claude-sonnet-4-20250514';
    const Claude =
      ChatAnthropic as unknown as new (fields: Record<string, unknown>) => BaseChatModel;
    const llm = new Claude({
      anthropicApiKey: apiKey,
      model,
      temperature: options.temperature,
      ...(options.maxOutputTokens != null ? { maxTokens: options.maxOutputTokens } : {}),
    });
    return { llm, provider: 'anthropic' };
  }

  if (provider === 'google') {
    const apiKey = config.get<string>(AGENT_CONFIG_KEYS.GOOGLE_API_KEY);
    if (!apiKey?.trim()) {
      return null;
    }
    const model =
      config.get<string>(AGENT_CONFIG_KEYS.AGENT_GOOGLE_MODEL) ??
      'gemini-2.0-flash';
    const Gemini =
      ChatGoogleGenerativeAI as unknown as new (fields: Record<string, unknown>) => BaseChatModel;
    const llm = new Gemini({
      apiKey,
      model,
      temperature: options.temperature,
      ...(options.maxOutputTokens != null ? { maxOutputTokens: options.maxOutputTokens } : {}),
    });
    return { llm, provider: 'google' };
  }

  const apiKey = config.get<string>(AGENT_CONFIG_KEYS.OPENAI_API_KEY);
  if (!apiKey?.trim()) {
    return null;
  }
  const modelName =
    config.get<string>(AGENT_CONFIG_KEYS.AGENT_MODEL) ?? 'gpt-4o';
  const OpenAI = ChatOpenAI as unknown as new (fields: Record<string, unknown>) => BaseChatModel;
  const llm = new OpenAI({
    modelName,
    temperature: options.temperature,
    openAIApiKey: apiKey,
    ...(options.maxOutputTokens != null ? { maxTokens: options.maxOutputTokens } : {}),
  });
  return { llm, provider: 'openai' };
}
