'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = getSupabaseBrowserClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/signup', '/', '/auth', '/auth/callback', '/dashboard'];
  const isPublicRoute = pathname ? publicRoutes.includes(pathname) : false;

  useEffect(() => {
    // Skip auth check for public routes
    if (isPublicRoute) {
      console.log('🔓 AuthGuard: Public route, skipping auth check');
      setIsLoading(false);
      setIsAuthenticated(true);
      return;
    }

    let authCheckTimeout: NodeJS.Timeout;

    const checkAuth = async () => {
      try {
        console.log('🔍 AuthGuard: Checking authentication...');
        
        // Longer delay to allow OAuth callback processing and session persistence
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthGuard: Auth check error:', error);
          setIsAuthenticated(false);
          authCheckTimeout = setTimeout(() => {
            router.push('/auth/login');
          }, 500);
        } else if (session) {
          console.log('✅ AuthGuard: User is authenticated', {
            userId: session.user.id,
            email: session.user.email
          });
          setIsAuthenticated(true);
        } else {
          console.log('❌ AuthGuard: No session found, redirecting to login');
          setIsAuthenticated(false);
          authCheckTimeout = setTimeout(() => {
            router.push('/auth/login');
          }, 500);
        }
      } catch (err) {
        console.error('💥 AuthGuard: Unexpected auth error:', err);
        setIsAuthenticated(false);
        authCheckTimeout = setTimeout(() => {
          router.push('/auth/login');
        }, 500);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes with debouncing
    let authChangeTimeout: NodeJS.Timeout;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 AuthGuard: Auth state changed:', event, { hasSession: !!session });
        
        // Clear any existing timeout
        if (authChangeTimeout) clearTimeout(authChangeTimeout);
        
        // Debounce auth state changes
        authChangeTimeout = setTimeout(() => {
          if (session) {
            console.log('✅ AuthGuard: Session established');
            setIsAuthenticated(true);
            setIsLoading(false);
          } else if (!isPublicRoute) {
            console.log('❌ AuthGuard: Session lost, redirecting to login');
            setIsAuthenticated(false);
            setIsLoading(false);
            router.push('/auth/login');
          }
        }, 300);
      }
    );

    return () => {
      if (authCheckTimeout) clearTimeout(authCheckTimeout);
      if (authChangeTimeout) clearTimeout(authChangeTimeout);
      subscription.unsubscribe();
    };
  }, [pathname, isPublicRoute, router, supabase]);

  // Show loading for protected routes
  if (isLoading && !isPublicRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show content if authenticated or on public route
  if (isAuthenticated || isPublicRoute) {
    return <>{children}</>;
  }

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}

