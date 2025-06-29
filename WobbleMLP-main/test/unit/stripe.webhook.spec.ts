import StripeWebhookHandler from '../../lib/billing/webhook';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Stripe from 'stripe';
import { Buffer } from 'buffer';

// Mock environment variables
vi.stubGlobal('process', {
  env: {
    STRIPE_SECRET_KEY: 'test-secret-key',
    STRIPE_WEBHOOK_SECRET: 'test-webhook-secret',
    SUPABASE_URL: 'test-supabase-url',
    SUPABASE_ANON_KEY: 'test-supabase-key'
  }
});

describe('StripeWebhookHandler', () => {
  let handler: StripeWebhookHandler;
  const mockStripe = new Stripe('test-secret-key', {
    apiVersion: '2025-05-28.basil',
  });

  beforeEach(() => {
    handler = new StripeWebhookHandler();
  });

  describe('event handling', () => {
    it('should handle payment intent succeeded', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test',
            amount: 1000,
            currency: 'usd',
            customer: 'cus_test',
            status: 'succeeded'
          }
        }
      } as Stripe.Event;

      const mockReq = {
        method: 'POST',
        headers: {
          'stripe-signature': 'valid_signature'
        },
        [Symbol.asyncIterator]: () => ({
          next: async () => ({
            value: Buffer.from(JSON.stringify(mockEvent)),
            done: true
          })
        })
      };

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        end: vi.fn()
      };

      vi.spyOn(mockStripe.webhooks, 'constructEvent').mockResolvedValue(mockEvent);

      await handler.handleWebhook(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ received: true });
    });
  });

  describe('signature validation', () => {
    it('should handle invalid signature', async () => {
      const mockReq = {
        method: 'POST',
        headers: {
          'stripe-signature': 'invalid_signature'
        },
        [Symbol.asyncIterator]: () => ({
          next: async () => ({
            value: Buffer.from(JSON.stringify({})),
            done: true
          })
        })
      };

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn()
      };

      vi.spyOn(mockStripe.webhooks, 'constructEvent').mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await handler.handleWebhook(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('Webhook Error: Invalid signature');
    });
  });
});
