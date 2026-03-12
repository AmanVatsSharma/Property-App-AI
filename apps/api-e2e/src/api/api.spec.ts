/**
 * @file api.spec.ts
 * @module api-e2e
 * @description E2E tests for NestJS API: root, health, GraphQL.
 * @author BharatERP
 * @created 2025-03-12
 */

import axios from 'axios';

describe('API e2e', () => {
  describe('GET /', () => {
    it('should return a message', async () => {
      const res = await axios.get('/');
      expect(res.status).toBe(200);
      expect(res.data).toEqual({ message: 'Hello API' });
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await axios.get('/health');
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.status).toBeDefined();
    });
  });

  describe('GraphQL', () => {
    it('should return properties query', async () => {
      const res = await axios.post('/graphql', {
        query: 'query { properties(filter: {}) { id title } }',
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(res.status).toBe(200);
      expect(res.data.data).toBeDefined();
      expect(Array.isArray(res.data.data.properties)).toBe(true);
    });
  });
});
