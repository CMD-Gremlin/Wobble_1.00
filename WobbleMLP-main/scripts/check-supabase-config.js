require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

async function checkConfig() {
  try {
    console.log('🔍 Checking Supabase project configuration...');
    
    // 1. Test REST API access
    console.log('\n🔹 Testing REST API access...');
    try {
      const restUrl = `${SUPABASE_URL}/rest/v1/`;
      const restResponse = await axios.get(restUrl, {
        headers: { 'apikey': SUPABASE_KEY },
        validateStatus: () => true,
      });
      console.log(`✅ REST API Status: ${restResponse.status} ${restResponse.statusText}`);
      if (restResponse.status !== 200) {
        console.log('Response:', restResponse.data);
      }
    } catch (error) {
      console.error('❌ REST API Error:', error.message);
    }
    
    // 2. Test Auth settings
    console.log('\n🔹 Testing Auth configuration...');
    try {
      const authUrl = `${SUPABASE_URL}/auth/v1/settings`;
      const authResponse = await axios.get(authUrl, {
        headers: { 'apikey': SUPABASE_KEY },
        validateStatus: () => true,
      });
      
      console.log(`✅ Auth API Status: ${authResponse.status} ${authResponse.statusText}`);
      
      if (authResponse.status === 200) {
        const settings = authResponse.data;
        console.log('\n🔐 Auth Settings:');
        console.log('Site URL:', settings.SITE_URL);
        console.log('JWT Expiry:', settings.JWT_EXPIRY);
        console.log('Enable Signup:', settings.ENABLE_SIGNUP);
        
        if (settings.EXTERNAL) {
          console.log('\n🔗 OAuth Providers:');
          Object.entries(settings.EXTERNAL).forEach(([provider, config]) => {
            console.log(`\n${provider.toUpperCase()}:`);
            console.log('  Enabled:', config.enabled);
            if (config.redirect_uri) {
              console.log('  Redirect URI:', config.redirect_uri);
            }
          });
        }
        
        console.log('\n🔗 Redirect URLs:');
        console.log(settings.SITE_URL ? `- ${settings.SITE_URL}/*` : 'None configured');
        
      } else {
        console.error('❌ Failed to fetch auth settings:', authResponse.data);
      }
    } catch (error) {
      console.error('❌ Auth API Error:', error.message);
    }
    
    // 3. Test CORS configuration
    console.log('\n🔹 Testing CORS configuration...');
    try {
      const corsUrl = `${SUPABASE_URL}/auth/v1/settings`;
      const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      
      const corsResponse = await axios.options(corsUrl, {
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'authorization,apikey',
        },
        validateStatus: () => true,
      });
      
      console.log(`CORS Response Status: ${corsResponse.status}`);
      console.log('CORS Headers:', {
        'access-control-allow-origin': corsResponse.headers['access-control-allow-origin'],
        'access-control-allow-methods': corsResponse.headers['access-control-allow-methods'],
        'access-control-allow-headers': corsResponse.headers['access-control-allow-headers'],
        'access-control-allow-credentials': corsResponse.headers['access-control-allow-credentials'],
      });
      
      if (corsResponse.status === 200) {
        console.log('✅ CORS preflight successful');
      } else {
        console.warn('⚠️ CORS preflight may be misconfigured');
      }
      
    } catch (error) {
      console.error('❌ CORS Test Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Configuration check failed:', error);
  }
}

checkConfig();
