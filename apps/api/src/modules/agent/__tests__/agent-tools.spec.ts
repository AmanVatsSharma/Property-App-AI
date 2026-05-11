/**
 * @file agent-tools.spec.ts
 * @module agent
 * @description Unit tests for AgentToolsService.
 * @author BharatERP
 * @created 2025-03-11
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AgentToolsService } from '../services/agent-tools.service';
import { PropertyService } from '@api/modules/property/services/property.service';
import { AreaService } from '@api/modules/area/services/area.service';
import { PriceForecastService } from '@api/modules/area/services/price-forecast.service';
import { ReraCheckService } from '@api/modules/area/services/rera-check.service';
import { DocumentAnalysisService } from '@api/modules/area/services/document-analysis.service';
import { NegotiationAdvisorService } from '@api/modules/area/services/negotiation-advisor.service';
import { LoggerService } from '@api/shared/logger';
import { PropertyNotFoundError } from '@api/common/errors';
import { Property } from '@api/modules/property/entities/property.entity';
import { Area } from '@api/modules/area/entities/area.entity';

const mockProperty: Property = {
  id: 'uuid-1',
  title: 'Test Property',
  location: 'Bangalore',
  areaId: null,
  locality: null,
  city: null,
  latitude: null,
  longitude: null,
  price: 10000000,
  type: 'apartment',
  bedrooms: 3,
  bathrooms: 2,
  areaSqft: 1500,
  status: 'ready',
  listingFor: 'sell',
  specs: null,
  aiTip: null,
  aiScore: null,
  coverImageUrl: null,
  imageUrls: null,
  nearbyAmenities: null,
  createdByUserId: null,
  isFreeListing: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockArea: Area = {
  id: 'area-1',
  locality: 'Koramangala',
  city: 'Bangalore',
  localityNormalized: 'koramangala',
  cityNormalized: 'bangalore',
  livabilityScore: 80,
  connectivityScore: 85,
  schoolsScore: 75,
  safetyScore: 78,
  priceTrendPctAnnual: 10,
  amenitiesSummary: 'Good connectivity, schools nearby.',
  dataSource: 'llm',
  lastAssessedAt: new Date(),
  latitude: null,
  longitude: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AgentToolsService', () => {
  let service: AgentToolsService;
  let propertyService: jest.Mocked<PropertyService>;
  let areaService: jest.Mocked<AreaService>;

  beforeEach(async () => {
    const mockPropertyService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      updateAiScoresFromAgent: jest.fn(),
    };
    const mockAreaService = {
      getOrCreate: jest.fn().mockResolvedValue(mockArea),
      findById: jest.fn(),
    };
    const mockLogger = { debug: jest.fn(), log: jest.fn(), error: jest.fn(), warn: jest.fn() };

    const mockPriceForecast = { getForecast: jest.fn().mockResolvedValue({}) };

    const mockReraCheck = {
      check: jest.fn().mockResolvedValue({
        query: '',
        status: 'unknown',
        projectName: null,
        builderName: null,
        state: null,
        rationale: 'stub',
        portalUrl: 'https://rera.gov.in',
        nextStep: 'stub',
        confidence: 'low',
        lastChecked: new Date().toISOString(),
      }),
      formatForAgent: jest.fn().mockReturnValue('RERA check stub'),
    };

    const mockDocumentAnalysis = {
      analyze: jest.fn().mockResolvedValue({
        documentType: 'Unknown',
        overallRisk: 'yellow',
        summary: 'stub',
        flags: [],
        positives: [],
        recommendedActions: [],
        disclaimer: 'stub',
        confidence: 'low',
        lastAnalyzed: new Date().toISOString(),
      }),
      formatForAgent: jest.fn().mockReturnValue('Document analysis stub'),
    };

    const mockNegotiationAdvisor = {
      advise: jest.fn().mockResolvedValue({
        propertyId: 'uuid-1',
        found: true,
        askPrice: 10000000,
        pricePerSqft: null,
        suggestedOfferInr: 9500000,
        marginPctBelowAsk: 5,
        strategy: 'stub strategy',
        signals: [],
        walkAwayIf: [],
        confidence: 'low',
        source: 'baseline',
        lastAdvised: new Date().toISOString(),
      }),
      notFound: jest.fn().mockReturnValue({
        propertyId: 'missing',
        found: false,
        askPrice: null,
        pricePerSqft: null,
        suggestedOfferInr: null,
        marginPctBelowAsk: null,
        strategy: 'Property missing not found.',
        signals: [],
        walkAwayIf: [],
        confidence: 'low',
        source: 'not_found',
        lastAdvised: new Date().toISOString(),
      }),
      formatForAgent: jest.fn().mockReturnValue('Negotiation advice stub'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentToolsService,
        { provide: PropertyService, useValue: mockPropertyService },
        { provide: AreaService, useValue: mockAreaService },
        { provide: PriceForecastService, useValue: mockPriceForecast },
        { provide: ReraCheckService, useValue: mockReraCheck },
        { provide: DocumentAnalysisService, useValue: mockDocumentAnalysis },
        { provide: NegotiationAdvisorService, useValue: mockNegotiationAdvisor },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<AgentToolsService>(AgentToolsService);
    propertyService = module.get(PropertyService) as jest.Mocked<PropertyService>;
    areaService = module.get(AreaService) as jest.Mocked<AreaService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTools', () => {
    it('should return an array of tools', () => {
      const tools = service.getTools();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThanOrEqual(1);
    });

    it('should include search_properties, get_property, and compare_properties tools', () => {
      const tools = service.getTools();
      const names = tools.map((t) => t.name);
      expect(names).toContain('search_properties');
      expect(names).toContain('get_property');
      expect(names).toContain('compare_properties');
    });
  });

  describe('invokeTool', () => {
    it('should return error content for unknown tool', async () => {
      const result = await service.invokeTool('unknown_tool', {});
      expect(result.content).toContain('Unknown tool');
    });

    it('should invoke get_property and return summary when property exists', async () => {
      propertyService.findOne.mockResolvedValue(mockProperty);
      const result = await service.invokeTool('get_property', { property_id: 'uuid-1' });
      expect(result.content).toContain('Test Property');
      expect(result.content).toContain('Bangalore');
    });

    it('should return not found message when get_property fails', async () => {
      propertyService.findOne.mockRejectedValue(new PropertyNotFoundError('missing'));
      const result = await service.invokeTool('get_property', { property_id: 'missing' });
      expect(result.content).toContain('not found');
    });

    it('should invoke compare_properties and return comparison when properties exist', async () => {
      propertyService.findOne.mockResolvedValue(mockProperty);
      const result = await service.invokeTool('compare_properties', {
        property_ids: ['uuid-1', 'uuid-2'],
      });
      expect(result.content).toContain('Comparison');
      expect(result.content).toContain('Test Property');
      expect(result.content).toContain('Bangalore');
    });
  });

  describe('scoreAndPersistProperty', () => {
    it('should update property with aiScore and aiTip', async () => {
      propertyService.findOne.mockResolvedValue(mockProperty);
      propertyService.updateAiScoresFromAgent.mockResolvedValue({
        ...mockProperty,
        aiScore: 85,
        aiTip: 'Good value for the locality.',
      });
      const result = await service.scoreAndPersistProperty('uuid-1');
      expect(propertyService.updateAiScoresFromAgent).toHaveBeenCalledWith(
        'uuid-1',
        expect.any(Number),
        expect.any(String),
      );
      expect(result.aiScore).toBe(85);
      expect(result.aiTip).toContain('Good value');
    });

    it('should throw when property not found', async () => {
      propertyService.findOne.mockRejectedValue(new PropertyNotFoundError('missing'));
      await expect(service.scoreAndPersistProperty('missing')).rejects.toMatchObject({
        name: 'PropertyNotFoundError',
        message: expect.stringContaining('not found'),
      });
    });
  });
});
