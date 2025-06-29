'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing authentication...');
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Callback: Processing OAuth callback...');
        
        if (!searchParams) {
          console.error('❌ Callback: No search parameters available');
          setStatus('Error: No parameters received');
          setTimeout(() => router.push('/auth/login?error=no_params'), 3000);
          return;
        }

        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('📋 Callback: URL parameters:', { 
          hasCode: !!code, 
          error, 
          errorDescription,
          fullUrl: window.location.href 
        });

        if (error) {
          console.error('❌ Callback: OAuth error:', error, errorDescription);
          setStatus(`Authentication failed: ${errorDescription || error}`);
          setTimeout(() => router.push('/auth/login?error=' + encodeURIComponent(error)), 3000);
          return;
        }

        if (!code) {
          console.error('❌ Callback: No authorization code received');
          setStatus('Error: No authorization code received');
          setTimeout(() => router.push('/auth/login?error=no_code'), 3000);
          return;
        }

        console.log('✅ Callback: Authorization code received, exchanging for session...');
        setStatus('Exchanging authorization code for session...');

        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error('❌ Callback: Failed to exchange code for session:', exchangeError);
          setStatus(`Failed to complete authentication: ${exchangeError.message}`);
          setTimeout(() => router.push('/auth/login?error=' + encodeURIComponent(exchangeError.message)), 3000);
          return;
        }

        if (data.session) {
          console.log('✅ Callback: Session created successfully!', {
            userId: data.session.user.id,
            email: data.session.user.email
          });
          setStatus('Authentication successful! Redirecting to dashboard...');
          
          // Wait a moment to ensure session is fully persisted
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        } else {
          console.error('❌ Callback: No session returned from code exchange');
          setStatus('Error: Failed to create session');
          setTimeout(() => router.push('/auth/login?error=no_session'), 3000);
        }

      } catch (err: any) {
        console.error('💥 Callback: Unexpected error:', err);
        setStatus(`Unexpected error: ${err.message}`);
        setTimeout(() => router.push('/auth/login?error=' + encodeURIComponent(err.message)), 3000);
      }
    };

    handleAuthCallback();
  }, [searchParams, router, supabase]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}

