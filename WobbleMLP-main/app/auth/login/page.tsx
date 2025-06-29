'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginButton from '../LoginButton';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect to home if already logged in
    const checkSession = async () => {
      const { getSupabaseBrowserClient } = await import('@/lib/supabaseClient');
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const redirectTo = searchParams?.get('redirectedFrom') || '/';
        router.push(redirectTo);
      }
    };
    
    checkSession();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Wobble</h1>
          <p className="text-gray-600">Sign in to continue to your account</p>
        </div>
        
        <div className="mt-6">
          <LoginButton />
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}
