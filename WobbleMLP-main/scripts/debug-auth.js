const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configure logging
const logFile = path.join(__dirname, 'auth-debug.log');
const logStream = fs.createWriteStream(logFile, { flags: 'w' });

function log(...args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
  ).join(' ');
  
  const logMessage = `[${timestamp}] ${message}\n`;
  process.stdout.write(logMessage);
  logStream.write(logMessage);
}

// Load environment
log('Loading environment...');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log environment
log('Environment:');
log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
log(`- NEXT_PUBLIC_SITE_URL: ${process.env.NEXT_PUBLIC_SITE_URL || 'Not set'}`);
log(`- NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL ? 'Set' : 'Not set'}`);
log(`- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_KEY ? 'Set' : 'Not set'}`);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  log('❌ Error: Missing required Supabase environment variables');
  process.exit(1);
}

// Initialize Supabase client
log('\nInitializing Supabase client...');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

// Test functions
async function testAuth() {
  try {
    log('\n🔐 Testing authentication...');
    
    // Test 1: Get current session
    await testGetSession();
    
    // Test 2: Test OAuth flow
    await testOAuth('github');
    
  } catch (error) {
    log('❌ Test failed:', error);
  } finally {
    log('\n✅ Tests completed. Check auth-debug.log for full details.');
    logStream.end();
  }
}

async function testGetSession() {
  log('\n🔍 Testing getSession()...');
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    log('Current session:', data.session ? 'Authenticated' : 'No active session');
    if (data.session) {
      log('Session details:', {
        user: data.session.user.email,
        expiresAt: new Date(data.session.expires_at * 1000).toISOString(),
      });
    }
    
    return data.session;
  } catch (error) {
    log('❌ getSession() error:', error.message);
    throw error;
  }
}

async function testOAuth(provider) {
  log(`\n🔑 Testing ${provider} OAuth...`);
  
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`;
  log(`Using redirect URL: ${redirectUrl}`);
  
  try {
    log('\n1. Generating OAuth URL...');
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
      log(`❌ ${provider} OAuth error:`, {
        message: error.message,
        status: error.status,
        name: error.name,
        __isAuthError: error.__isAuthError,
        __errorContext: error.__errorContext,
      });
      return;
    }
    
    if (data?.url) {
      log(`✅ ${provider} OAuth URL generated successfully`);
      log('OAuth URL:', data.url);
      
      // Test if the URL is accessible
      await testUrlAccess(data.url);
    } else {
      log('⚠️ No URL returned from OAuth flow');
    }
    
  } catch (error) {
    log(`❌ ${provider} OAuth failed:`, {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
  }
}

async function testUrlAccess(url) {
  try {
    log('\n🔗 Testing URL accessibility...');
    const axios = require('axios');
    const response = await axios.head(url, {
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
    });
    
    log(`✅ URL is accessible (Status: ${response.status})`);
    log('Response headers:', JSON.stringify(response.headers, null, 2));
    
  } catch (error) {
    log('⚠️ URL access test failed:', {
      message: error.message,
      status: error.response?.status,
      headers: error.response?.headers,
    });
  }
}

// Run tests
log('\n🚀 Starting authentication tests...');
testAuth().catch(error => {
  log('❌ Unhandled error:', error);
  logStream.end();
  process.exit(1);
});
