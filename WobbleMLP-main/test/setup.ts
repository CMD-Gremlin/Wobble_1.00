// Add global test setup here
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock global objects
if (typeof window !== 'undefined') {
  // Browser environment setup
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock Stripe with ESM compatibility
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: vi.fn().mockImplementation((body, signature, secret) => ({
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
      }))
    }
  }))
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.STRIPE_SECRET_KEY = 'test-stripe-secret-key';
process.env.STRIPE_WEBHOOK_SECRET = 'test-webhook-secret';
