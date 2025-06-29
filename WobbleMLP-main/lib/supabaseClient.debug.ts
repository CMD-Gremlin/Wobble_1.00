import { createClient } from '@supabase/supabase-js';
import type { CookieMethods } from './types';
import type { Database } from '@/types/database.types';

type SupabaseClientType = ReturnType<typeof createClient<Database, 'public'>>;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Enhanced logger for debugging
export const debug = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Supabase Debug]', ...args);
  }
};

// Create a singleton browser client with enhanced debugging
export const getSupabaseBrowserClient = (): SupabaseClientType => {
  // Log initialization
  debug('Initializing Supabase client with URL:', {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    isBrowser: typeof window !== 'undefined',
  });

  const client = createClient<Database, 'public'>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: true, // Enable debug mode
        storageKey: 'sb-auth-token',
        storage: {
          getItem: (key: string) => {
            try {
              if (typeof window === 'undefined') return null;
              const value = localStorage.getItem(key);
              debug('Storage getItem:', { key, value });
              return value;
            } catch (error) {
              console.error('Error in storage getItem:', error);
              return null;
            }
          },
          setItem: (key: string, value: string) => {
            try {
              if (typeof window === 'undefined') return;
              debug('Storage setItem:', { key, value });
              localStorage.setItem(key, value);
            } catch (error) {
              console.error('Error in storage setItem:', error);
            }
          },
          removeItem: (key: string) => {
            try {
              if (typeof window === 'undefined') return;
              debug('Storage removeItem:', { key });
              localStorage.removeItem(key);
            } catch (error) {
              console.error('Error in storage removeItem:', error);
            }
          },
        },
      },
    }
  );

  // Add response interceptors for debugging
  const originalRequest = client.auth['_request'];
  client.auth['_request'] = async (...args: any[]) => {
    const [url, options] = args;
    debug('Auth Request:', { url: url.toString(), options });
    
    try {
      const response = await originalRequest.call(client.auth, ...args);
      debug('Auth Response:', response);
      return response;
    } catch (error) {
      debug('Auth Request Error:', error);
      throw error;
    }
  };

  return client;
};

// Export for backward compatibility
export const supabaseBrowser = getSupabaseBrowserClient();
