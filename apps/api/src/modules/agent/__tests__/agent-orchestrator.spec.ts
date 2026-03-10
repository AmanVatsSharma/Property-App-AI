/**
 * @file agent-orchestrator.spec.ts
 * @module agent
 * @description Unit tests for AgentOrchestratorService.
 * @author BharatERP
 * @created 2025-03-11
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AgentOrchestratorService } from '../services/agent-orchestrator.service';
import { AgentToolsService } from '../services/agent-tools.service';
import { LoggerService } from '../../../shared/logger';

describe('AgentOrchestratorService', () => {
  let service: AgentOrchestratorService;
  let config: jest.Mocked<ConfigService>;
  let tools: jest.Mocked<Pick<AgentToolsService, 'getTools'>>;

  beforeEach(async () => {
    const mockConfig = {
      get: jest.fn((key: string) => {
        if (key === 'OPENAI_API_KEY') return '';
        if (key === 'AGENT_PROVIDER') return 'openai';
        if (key === 'ANTHROPIC_API_KEY') return '';
        if (key === 'AGENT_MODEL') return 'gpt-4o';
        if (key === 'AGENT_MAX_STEPS') return 10;
        if (key === 'AGENT_PLAN_FIRST') return false;
        return undefined;
      }),
    };
    const mockTools = {
      getTools: jest.fn().mockReturnValue([]),
    };
    const mockLogger = { debug: jest.fn(), log: jest.fn(), error: jest.fn(), warn: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentOrchestratorService,
        { provide: AgentToolsService, useValue: mockTools },
        { provide: LoggerService, useValue: mockLogger },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AgentOrchestratorService>(AgentOrchestratorService);
    config = module.get(ConfigService) as jest.Mocked<ConfigService>;
    tools = module.get(AgentToolsService) as jest.Mocked<Pick<AgentToolsService, 'getTools'>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ask', () => {
    it('should return stub when OPENAI_API_KEY is missing', async () => {
      (config.get as jest.Mock).mockImplementation((key: string) =>
        key === 'OPENAI_API_KEY' ? '' : undefined,
      );
      const result = await service.ask({ prompt: 'Hello' });
      expect(result.answer).toContain('OPENAI_API_KEY');
      expect(result.sources).toEqual([]);
      expect(result.suggestedActions).toEqual([]);
    });

    it('should return result shape with answer, sources, suggestedActions', async () => {
      const result = await service.ask({
        prompt: 'What properties are in Bangalore?',
        context: { locality: 'Whitefield', city: 'Bangalore' },
      });
      expect(result).toHaveProperty('answer');
      expect(result).toHaveProperty('sources');
      expect(result).toHaveProperty('suggestedActions');
      expect(Array.isArray(result.sources)).toBe(true);
      expect(Array.isArray(result.suggestedActions)).toBe(true);
    });

    it('should return stub when AGENT_PROVIDER is anthropic and ANTHROPIC_API_KEY is missing', async () => {
      (config.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'AGENT_PROVIDER') return 'anthropic';
        if (key === 'ANTHROPIC_API_KEY') return '';
        return undefined;
      });
      const result = await service.ask({ prompt: 'Hello' });
      expect(result.answer).toContain('ANTHROPIC_API_KEY');
      expect(result.sources).toEqual([]);
    });
  });
});
