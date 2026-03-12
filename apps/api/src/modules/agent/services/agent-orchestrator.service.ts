/**
 * @file agent-orchestrator.service.ts
 * @module agent
 * @description LangGraph/LangChain agent loop; model factory (OpenAI/Claude), extended thinking, plan-first, tools.
 * @author BharatERP
 * @created 2025-03-11
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import type { BaseMessage } from '@langchain/core/messages';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { LoggerService } from '../../../shared/logger';
import { AgentToolsService } from './agent-tools.service';
import type { AskAgentResult } from '../dtos/ask-agent-result.dto';
import type { AskAgentInput } from '../dtos/ask-agent-input.dto';
import { AGENT_CONFIG_KEYS } from '../config/agent-config';
import { DOMAIN_SYSTEM_PROMPT, PLAN_FIRST_INSTRUCTION } from '../prompts/domain-system.prompt';

@Injectable()
export class AgentOrchestratorService {
  constructor(
    private readonly tools: AgentToolsService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  async ask(input: AskAgentInput, requestId?: string): Promise<AskAgentResult> {
    const startMs = Date.now();
    const provider = this.config.get<'openai' | 'anthropic'>(AGENT_CONFIG_KEYS.AGENT_PROVIDER) ?? 'openai';
    const model = provider === 'anthropic'
      ? this.config.get<string>(AGENT_CONFIG_KEYS.AGENT_ANTHROPIC_MODEL) ?? 'claude-sonnet'
      : this.config.get<string>(AGENT_CONFIG_KEYS.AGENT_MODEL) ?? 'gpt-4o';
    this.logger.debug('ask entry', {
      method: 'ask',
      requestId,
      promptLength: input.prompt?.length ?? 0,
      provider,
      model,
    });

    if (provider === 'anthropic') {
      const anthropicKey = this.config.get<string>(AGENT_CONFIG_KEYS.ANTHROPIC_API_KEY);
      if (!anthropicKey || anthropicKey.trim() === '') {
        this.logger.debug('ask exit (no Anthropic key)', { method: 'ask', requestId });
        return {
          answer:
            'AI agent is not configured (missing ANTHROPIC_API_KEY). Set it in the environment to use Claude.',
          sources: [],
          suggestedActions: [],
        };
      }
    } else {
      const openaiKey = this.config.get<string>(AGENT_CONFIG_KEYS.OPENAI_API_KEY);
      if (!openaiKey || openaiKey.trim() === '') {
        this.logger.debug('ask exit (no API key)', { method: 'ask', requestId });
        return {
          answer:
            'AI agent is not configured (missing OPENAI_API_KEY). Set it in the environment to use the assistant.',
          sources: [],
          suggestedActions: [],
        };
      }
    }

    const maxSteps = this.config.get<number>(AGENT_CONFIG_KEYS.AGENT_MAX_STEPS) ?? 10;
    const planFirst = this.config.get<boolean>(AGENT_CONFIG_KEYS.AGENT_PLAN_FIRST) ?? false;

    try {
      const llm = this.createLlm();
      const toolList = this.tools.getTools();
      const modelWithTools = llm.bindTools(toolList);

      const sources: AskAgentResult['sources'] = [];
      const suggestedActions: AskAgentResult['suggestedActions'] = [];

      let systemContent = DOMAIN_SYSTEM_PROMPT;
      if (planFirst) {
        systemContent += `\n\n${PLAN_FIRST_INSTRUCTION}`;
      }

      const contextHint =
        input.context?.propertyId || input.context?.locality || input.context?.city
          ? ` Context: ${[input.context.propertyId && `property ${input.context.propertyId}`, input.context.locality, input.context.city].filter(Boolean).join(', ')}.`
          : '';
      const userContent = input.prompt + contextHint;

      const messages: BaseMessage[] = [
        new SystemMessage(systemContent),
        new HumanMessage(userContent),
      ];

      let lastResponse: AIMessage | null = null;
      let steps = 0;

      while (steps < maxSteps) {
        steps += 1;
        const response = (await modelWithTools.invoke(messages)) as AIMessage;
        lastResponse = response;

        const toolCalls = response.tool_calls ?? [];
        if (toolCalls.length === 0) {
          const text = typeof response.content === 'string' ? response.content : (response.content as unknown[])?.[0]?.text ?? '';
          const durationMs = Date.now() - startMs;
          this.logger.info('ask completed', {
            method: 'ask',
            requestId,
            steps,
            durationMs,
            provider,
            model,
            inputSize: input.prompt?.length ?? 0,
          });
          return {
            answer: text || 'I could not generate a response.',
            sources,
            suggestedActions,
          };
        }

        messages.push(response);

        for (const tc of toolCalls) {
          const name = tc.name;
          const args = (typeof tc.args === 'object' && tc.args != null ? tc.args : {}) as Record<string, unknown>;
          const toolCallId = tc.id ?? `call_${steps}_${name}`;
          try {
            const toolResult = await this.tools.invokeTool(name, args, requestId);
            messages.push(
              new ToolMessage({
                content: toolResult.content,
                tool_call_id: toolCallId,
              }),
            );
            if (toolResult.sources?.length) {
              sources.push(...toolResult.sources);
            }
            if (toolResult.suggestedActions?.length) {
              suggestedActions.push(...toolResult.suggestedActions);
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            messages.push(
              new ToolMessage({
                content: `Error: ${message}`,
                tool_call_id: toolCallId,
                status: 'error',
              }),
            );
          }
        }
      }

      const finalText =
        lastResponse && typeof lastResponse.content === 'string'
          ? lastResponse.content
          : 'I reached the step limit. Please try a shorter or more specific question.';
      const durationMs = Date.now() - startMs;
      this.logger.info('ask completed (max steps)', {
        method: 'ask',
        requestId,
        steps,
        durationMs,
        provider,
        model,
        inputSize: input.prompt?.length ?? 0,
      });
      return {
        answer: finalText,
        sources,
        suggestedActions,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const durationMs = Date.now() - startMs;
      this.logger.warn(
        { method: 'ask', requestId, error: message, durationMs, provider, model: model ?? 'n/a' },
        'Agent ask failed',
      );
      return {
        answer: `Sorry, something went wrong: ${message}. Please try again.`,
        sources: [],
        suggestedActions: [],
      };
    }
  }

  /**
   * Creates the LLM instance based on AGENT_PROVIDER; supports OpenAI and Anthropic (Claude) with optional extended thinking.
   */
  private createLlm(): BaseChatModel {
    const provider = this.config.get<'openai' | 'anthropic'>(AGENT_CONFIG_KEYS.AGENT_PROVIDER) ?? 'openai';

    if (provider === 'anthropic') {
      const apiKey = this.config.get<string>(AGENT_CONFIG_KEYS.ANTHROPIC_API_KEY);
      const model = this.config.get<string>(AGENT_CONFIG_KEYS.AGENT_ANTHROPIC_MODEL) ?? 'claude-sonnet-4-20250514';
      const thinkingBudget = this.config.get<number>(AGENT_CONFIG_KEYS.AGENT_THINKING_BUDGET_TOKENS);
      const maxTokens = thinkingBudget != null ? Math.max(8192, thinkingBudget + 2048) : 8192;

      const options: ConstructorParameters<typeof ChatAnthropic>[0] = {
        anthropicApiKey: apiKey,
        model,
        temperature: 0.2,
        maxTokens,
      };

      if (thinkingBudget != null && thinkingBudget > 0) {
        options.thinking = { type: 'enabled', budget_tokens: thinkingBudget };
      }

      return new ChatAnthropic(options);
    }

    const openaiKey = this.config.get<string>(AGENT_CONFIG_KEYS.OPENAI_API_KEY);
    const modelName = this.config.get<string>(AGENT_CONFIG_KEYS.AGENT_MODEL) ?? 'gpt-4o';
    return new ChatOpenAI({
      modelName,
      temperature: 0.2,
      openAIApiKey: openaiKey,
    });
  }
}
