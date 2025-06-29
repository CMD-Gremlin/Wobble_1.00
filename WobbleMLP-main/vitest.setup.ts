import { Buffer } from 'buffer';

// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'test-secret-key';
process.env.STRIPE_WEBHOOK_SECRET = 'test-webhook-secret';
process.env.SUPABASE_URL = 'test-supabase-url';
process.env.SUPABASE_ANON_KEY = 'test-supabase-key';

// Add Buffer to global scope
global.Buffer = Buffer;
