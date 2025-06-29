'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';
import LoginButton from './auth/LoginButton';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // User is already authenticated, redirect to dashboard
          console.log('✅ Home: User authenticated, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
        
        setUser(null);
      } catch (error) {
        console.error('❌ Home: Error checking auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ Home: User signed in, redirecting to dashboard');
          router.push('/dashboard');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <img 
              src="/images/wobble-main.svg" 
              alt="Wobble" 
              className="w-16 h-16 animate-bounce"
            />
          </div>
          <p className="text-purple-600 font-medium">Wobble is waking up...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/images/wobble-main.svg" 
                alt="Wobble" 
                className="w-10 h-10 rounded-full"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Wobble
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="mb-8">
            {/* Main Wobble Character */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img 
                  src="/images/wobble-main.svg" 
                  alt="Wobble - Your AI Tool Builder" 
                  className="w-32 h-32 drop-shadow-lg hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl mb-4">
              Meet 
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Wobble</span>
            </h1>
            <p className="text-xl text-gray-600 mb-2">Your friendly AI companion for building tools</p>
            <p className="max-w-2xl mx-auto text-base text-gray-500 sm:text-lg">
              Originally designed as a context-aware browser pet, Wobble has evolved into your personal AI assistant. 
              Just describe what you want to build, and Wobble will create it for you!
            </p>
          </div>

          <div className="mt-10 flex justify-center">
            <div className="inline-flex rounded-xl shadow-lg">
              <LoginButton />
            </div>
          </div>
        </div>

        {/* Features Section with Wobble Characters */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Wobble Can Do</h2>
            <p className="text-gray-600">Meet the different sides of your AI companion</p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4">
                <Image 
                  src="/images/wobble-characters.png" 
                  alt="Wobble Characters" 
                  width={64} 
                  height={64}
                  className="rounded-lg"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Natural Conversation</h3>
              <p className="text-gray-600">
                Just chat with Wobble in plain English. No coding required - describe what you need and watch it come to life!
              </p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Creation</h3>
              <p className="text-gray-600">
                From calculators to complex apps, Wobble generates working tools in seconds. No waiting, no complexity.
              </p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">🔗</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Combinations</h3>
              <p className="text-gray-600">
                Chain multiple tools together to create powerful workflows. Wobble understands how tools work together.
              </p>
            </div>
          </div>
        </div>

        {/* Browser Pet Heritage Section */}
        <div className="mt-20 bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl p-8 border border-purple-200">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <Image 
                src="/images/wobble-browser.png" 
                alt="Wobble Browser Pet" 
                width={200} 
                height={150}
                className="rounded-2xl shadow-lg"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                From Browser Pet to AI Builder
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                Wobble started life as a context-aware browser companion, designed to understand and interact with web content. 
                That same intelligence now powers your tool creation experience.
              </p>
              <p className="text-gray-600">
                <span className="font-medium text-purple-600">Fun fact:</span> Wobble still remembers its browser roots and loves helping you build web-based tools!
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-purple-100">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image 
                src="/images/wobble-main.png" 
                alt="Wobble Ready" 
                width={80} 
                height={80}
                className="animate-pulse"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Build with Wobble?
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Sign in with Google and let Wobble help you create amazing tools in minutes, not hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <LoginButton />
              <p className="text-sm text-gray-500">
                ✨ No credit card required • Free to start
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-purple-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Image 
                src="/images/wobble-main.png" 
                alt="Wobble" 
                width={32} 
                height={32}
                className="rounded-full"
              />
              <p className="text-gray-600">
                &copy; 2024 Wobble. Your friendly AI tool builder.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Built with ❤️ and lots of purple
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

