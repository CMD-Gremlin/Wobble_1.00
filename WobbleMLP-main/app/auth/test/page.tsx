'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient.debug';

export default function AuthTestPage() {
  const [authState, setAuthState] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        
        // Check current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session);
            setAuthState({ event, session });
            setSession(session);
          }
        );

        return () => {
          subscription?.unsubscribe();
        };
      } catch (err) {
        console.error('Auth test error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    checkAuth();
  }, []);

  const handleSignIn = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      
      // Log environment info
      console.log('Environment:', {
        origin: window.location.origin,
        href: window.location.href,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        nodeEnv: process.env.NODE_ENV,
      });
      
      // First, try to get the current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', sessionData);
      
      if (sessionError) {
        console.error('Session check error:', sessionError);
      }
      
      // Try with detailed error handling and multiple providers
      const providers = ['github', 'google', 'gitlab'];
      
      for (const provider of providers) {
        try {
          console.log(`Trying ${provider} provider...`);
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider as any,
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
              skipBrowserRedirect: true, // We'll handle the redirect manually
            },
          });
          
          console.log(`Sign in with ${provider} response:`, { data, error });
          
          if (error) {
            console.error(`${provider} sign in error:`, {
              name: error.name,
              message: error.message,
              status: error.status,
              __isAuthError: (error as any).__isAuthError,
              __errorContext: (error as any).__errorContext,
            });
            continue; // Try next provider
          }
          
          // If we have a URL, redirect to it
          if (data?.url) {
            window.location.href = data.url;
            return;
          }
          
          return; // Success
        } catch (err) {
          console.error(`Error with ${provider}:`, err);
          // Continue to next provider
        }
      }
      
      // If we get here but no error, log the successful response
      console.log('OAuth flow started successfully');
    } catch (err) {
      console.error('Sign in error:', {
        error: err,
        errorString: String(err),
        errorJSON: JSON.stringify(err, null, 2),
        errorObject: { ...err },
      });
      
      // More detailed error message
      let errorMessage = 'Sign in failed';
      if (err instanceof Error) {
        errorMessage = err.message;
        if ('status' in err) {
          errorMessage += ` (Status: ${err.status})`;
        }
      }
      setError(errorMessage);
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err instanceof Error ? err.message : 'Sign out failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Auth Test Page</h1>
        
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">Current Session:</h2>
            <pre className="text-sm bg-gray-50 p-2 rounded overflow-auto max-h-60">
              {JSON.stringify(session, null, 2) || 'No active session'}
            </pre>
          </div>
          
          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">Auth State:</h2>
            <pre className="text-sm bg-gray-50 p-2 rounded overflow-auto max-h-60">
              {authState ? JSON.stringify(authState, null, 2) : 'No auth state changes detected'}
            </pre>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleSignIn}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sign In with GitHub
            </button>
            
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
              <p className="font-semibold">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-800">Debug Information:</h3>
            <p className="text-sm text-blue-700 mt-2">
              • Check browser console for detailed logs
              • Verify cookies are being set correctly
              • Ensure Supabase project URL and anon key are correct
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
