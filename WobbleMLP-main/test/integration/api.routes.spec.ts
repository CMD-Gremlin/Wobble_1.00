import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupIntegrationTest, teardownIntegrationTest } from './setup';
import { vi } from 'vitest';

describe('API Routes Integration Tests', () => {
  let request: ReturnType<typeof createTestClient>;
  let port: number;

  beforeEach(async () => {
    const { server, request: req, port: p } = await setupIntegrationTest();
    request = req;
    port = p;
  });

  afterEach(async () => {
    await teardownIntegrationTest();
  });

  describe('OpenAI API route', () => {
    it('should handle successful OpenAI request', async () => {
      const response = await request.post('/api/openai').send({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('choices');
    });

    it('should handle quota exhaustion', async () => {
      const response = await request.post('/api/openai').send({
        messages: [{ role: 'user', content: 'Hello' }],
        headers: { 'x-rate-limit': 'exceeded' },
      });

      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Stripe Webhook route', () => {
    it('should handle plan downgrade webhook', async () => {
      const response = await request.post('/api/webhook/stripe').send({
        type: 'customer.subscription.updated',
        data: {
          object: {
            items: {
              data: [{
                price: { id: 'price_downgraded' },
              }],
            },
          },
        },
      }).set('stripe-signature', 'valid_signature');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });

    it('should reject invalid webhook signature', async () => {
      const response = await request.post('/api/webhook/stripe').send({
        type: 'customer.subscription.updated',
      }).set('stripe-signature', 'invalid_signature');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
