require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

console.log('🔍 Testing Supabase Auth with minimal configuration');
console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key:', SUPABASE_KEY ? `${SUPABASE_KEY.substring(0, 10)}...` : 'Not set');

// Minimal Supabase client
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
    debug: true,
  },
});

// Simple test function
async function testAuth() {
  try {
    console.log('\n🔑 Testing sign-in with OAuth...');
    
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`;
    console.log('Using redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });
    
    if (error) {
      console.error('❌ Auth error:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      
      if (error.status === 400) {
        console.error('\n🔧 Possible solutions:');
        console.error('1. Verify your Supabase project URL and anon key in .env.local');
        console.error('2. Check if the OAuth provider is enabled in your Supabase dashboard');
        console.error('3. Ensure the redirect URL is whitelisted in your Supabase project');
        console.error('4. Verify CORS settings in your Supabase project configuration');
      }
    } else {
      console.log('✅ Auth successful!');
      console.log('OAuth URL:', data?.url);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', {
      message: error.message,
      stack: error.stack,
    });
  }
}

// Run the test
testAuth().catch(console.error);
