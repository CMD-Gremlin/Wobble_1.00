const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Enable debug logging
process.env.DEBUG = 'true';

// Load environment variables
console.log('Loading environment variables from .env.local...');
require('dotenv').config({ path: '.env.local' });

// Log environment variables (without sensitive values)
console.log('Environment variables loaded:');
Object.entries(process.env)
  .filter(([key]) => key.startsWith('NEXT_PUBLIC_') || key.startsWith('SUPABASE_'))
  .forEach(([key, value]) => {
    console.log(`  ${key}=${key.includes('KEY') ? '***' : value}`);
  });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

console.log('\nInitializing Supabase client...');
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Anon Key: ${supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'Not set'}`);

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      debug: true,
      logger: (level, ...args) => {
        console.log(`[Supabase ${level.toUpperCase()}]`, ...args);
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-test-script/1.0',
      },
    },
  });

  module.exports = { supabase };
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error);
  process.exit(1);
}

const { supabase } = require('./test-supabase-config');
const axios = require('axios');

async function testConnection() {
  console.log('\n🔍 Testing Supabase connection...');
  
  try {
    // Test basic REST API connection
    const { data, error } = await supabase
      .from('_')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase REST API error:', error);
    } else {
      console.log('✅ Successfully connected to Supabase REST API');
    }
    
    // Test Auth API directly
    await testAuthAPI();
    
    // Test OAuth providers
    await testOAuthProviders();
    
    // Test CORS settings
    await testCORS();
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

async function testAuthAPI() {
  console.log('\n🔐 Testing Auth API...');
  
  try {
    // Get auth settings
    const { data: settings, error: settingsError } = await supabase.auth.settings();
    
    if (settingsError) throw settingsError;
    
    console.log('✅ Successfully retrieved auth settings');
    console.log('Site URL:', settings?.site_url);
    console.log('JWT Secret:', settings?.jwt_secret ? '***' : 'Not set');
    
    // Test JWT token
    if (settings?.jwt_secret) {
      const { data: jwtData, error: jwtError } = await supabase.auth.getSession();
      
      if (jwtError) {
        console.warn('⚠️ No active session (expected if not logged in)');
      } else {
        console.log('🔑 Active session found:', {
          user: jwtData.session?.user?.email,
          expiresAt: jwtData.session?.expires_at,
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Auth API test failed:', error.message);
    throw error;
  }
}

async function testOAuthProviders() {
  console.log('\n🔑 Testing OAuth Providers...');
  const providers = ['github', 'google', 'gitlab'];
  
  for (const provider of providers) {
    try {
      console.log(`\n🔄 Testing ${provider} OAuth flow...`);
      
      const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`;
      console.log(`Using redirect URL: ${redirectUrl}`);
      
      // Test OAuth URL generation
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        console.error(`❌ ${provider} error:`, error.message);
        if (error.status) console.error(`Status code: ${error.status}`);
        if (error.__errorContext) console.error('Context:', error.__errorContext);
      } else if (data?.url) {
        console.log(`✅ ${provider} OAuth URL generated successfully`);
        console.log('OAuth URL:', data.url);
        
        // Test if the OAuth URL is accessible
        try {
          const response = await axios.head(data.url, {
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400,
          });
          console.log(`🔗 ${provider} OAuth endpoint is accessible (${response.status})`);
        } catch (error) {
          console.warn(`⚠️ Could not access ${provider} OAuth endpoint:`, error.message);
        }
      }
    } catch (error) {
      console.error(`❌ Error testing ${provider}:`, error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
    }
  }
}

async function testCORS() {
  console.log('\n🌐 Testing CORS configuration...');
  
  try {
    const testUrl = `${supabaseUrl}/auth/v1/settings`;
    console.log(`Testing CORS for: ${testUrl}`);
    
    const response = await axios.options(testUrl, {
      headers: {
        'Origin': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,apikey',
      },
      validateStatus: () => true, // Don't throw on non-2xx status
    });
    
    console.log('CORS Response Status:', response.status);
    console.log('CORS Headers:', {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
      'access-control-allow-headers': response.headers['access-control-allow-headers'],
      'access-control-allow-credentials': response.headers['access-control-allow-credentials'],
    });
    
    if (response.status === 200) {
      console.log('✅ CORS preflight request successful');
    } else {
      console.warn('⚠️ CORS preflight request may be misconfigured');
    }
    
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
  }
}

// Run tests
(async () => {
  try {
    await testConnection();
    console.log('\n✨ All tests completed!');
  } catch (error) {
    console.error('\n❌ Tests failed with error:', error.message);
    process.exit(1);
  }
})();
