'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';

export default function LoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<string>('checking');
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    console.log('🔍 LoginButton: Setting up auth state listener...');
    
    let redirectTimeout: NodeJS.Timeout;
    
    // Check initial session with longer delay to allow URL processing
    const checkInitialSession = async () => {
      // Longer delay to ensure Supabase has processed the OAuth callback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('📋 LoginButton: Initial session check:', { 
        hasSession: !!session, 
        error,
        userId: session?.user?.id,
        email: session?.user?.email 
      });
      
      if (session) {
        console.log('✅ LoginButton: User already authenticated, redirecting to dashboard');
        setAuthState('authenticated');
        // Longer delay before redirect to ensure session is fully established
        redirectTimeout = setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setAuthState('unauthenticated');
      }
    };

    checkInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 LoginButton: Auth state change:', event, { 
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email 
        });
        
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ LoginButton: User signed in successfully!');
          setAuthState('authenticated');
          setLoading(false);
          
          // Clear any existing redirect timeout
          if (redirectTimeout) clearTimeout(redirectTimeout);
          
          // Wait longer to ensure session is fully persisted
          redirectTimeout = setTimeout(() => {
            console.log('🚀 LoginButton: Redirecting to dashboard...');
            router.push('/dashboard');
          }, 1500);
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 LoginButton: User signed out');
          setAuthState('unauthenticated');
          setLoading(false);
          if (redirectTimeout) clearTimeout(redirectTimeout);
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 LoginButton: Token refreshed');
        }
      }
    );

    return () => {
      console.log('🧹 LoginButton: Cleaning up auth listener');
      if (redirectTimeout) clearTimeout(redirectTimeout);
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setAuthState('signing_in');

    try {
      console.log('🚀 LoginButton: Starting Google OAuth...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ LoginButton: OAuth initiation error:', error);
        setError('Failed to start Google authentication. Please try again.');
        setLoading(false);
        setAuthState('unauthenticated');
      } else {
        console.log('🔄 LoginButton: Redirecting to Google...');
        // User will be redirected to Google, no need to set loading to false
      }
    } catch (err: any) {
      console.error('💥 LoginButton: Error during Google login:', err);
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
      setAuthState('unauthenticated');
    }
  };

  // Show different states
  if (authState === 'checking') {
    return (
      <div className="w-full">
        <div className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-50">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Checking authentication...
        </div>
      </div>
    );
  }

  if (authState === 'authenticated') {
    return (
      <div className="w-full">
        <div className="w-full flex items-center justify-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50">
          ✅ Signed in! Redirecting to dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Signing in...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

