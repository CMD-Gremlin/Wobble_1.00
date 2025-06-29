'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';
import PromptForm from '@/components/PromptForm';
import UserToolList from '@/components/UserToolList';
import ToolchainComposer from '@/components/ToolchainComposer';
import BillingDashboard from '@/components/BillingDashboard';
import TokenUsageWidget from '@/components/TokenUsageWidget';
import Image from 'next/image';

export default function Dashboard() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [wobbleMessage, setWobbleMessage] = useState("Hi there! I'm Wobble, ready to help you build amazing tools! 🛠️");
  const [currentTool, setCurrentTool] = useState<{html: string; script: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'tools' | 'billing'>('tools');

  const wobbleMessages = [
    "What shall we build today? I'm excited to help! ✨",
    "Ready to create something awesome? Let's do this! 🚀",
    "I love building tools with you! What's your next idea? 💡",
    "From browser pet to tool builder - I'm here for you! 🎯",
    "Describe your dream tool and I'll make it real! 🌟"
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('❌ Dashboard: No session found, redirecting to login');
          router.push('/auth/login');
          return;
        }
        
        console.log('✅ Dashboard: User authenticated:', session.user.email);
        setUser(session.user);
        
        // Rotate Wobble messages every 10 seconds
        const messageInterval = setInterval(() => {
          setWobbleMessage(wobbleMessages[Math.floor(Math.random() * wobbleMessages.length)]);
        }, 10000);

        return () => clearInterval(messageInterval);
        
      } catch (error) {
        console.error('❌ Dashboard: Error checking auth:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          console.log('✅ Dashboard: User signed out, redirecting to home');
          router.push('/');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase, wobbleMessages]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      console.log('✅ Dashboard: User signed out successfully');
    } catch (error) {
      console.error('❌ Dashboard: Error signing out:', error);
    }
  };

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
          <p className="text-purple-600 font-medium">Wobble is preparing your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <Image 
              src="/images/wobble-main.png" 
              alt="Wobble" 
              width={64} 
              height={64}
              className="opacity-50"
            />
          </div>
          <p className="text-gray-600">Wobble needs you to sign in first...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/images/wobble-main.svg" 
                alt="Wobble" 
                className="w-10 h-10 rounded-full hover:scale-110 transition-transform duration-200"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Wobble Dashboard
                </h1>
                <p className="text-sm text-gray-500">Your AI Tool Builder</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <TokenUsageWidget />
              <span className="text-sm text-gray-600 hidden sm:block">
                Welcome, <span className="font-medium text-purple-600">{user.email}</span>
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wobble Welcome Section */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl p-6 mb-8 border border-purple-200">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <img 
                src="/images/wobble-main.svg" 
                alt="Wobble" 
                className="w-16 h-16 animate-pulse hover:animate-bounce cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-purple-100">
                <p className="text-gray-800 font-medium">{wobbleMessage}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Just describe what you want to build below, and I'll create it for you!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-2 mb-8 border border-purple-100">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'tools'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-purple-50'
              }`}
            >
              🛠️ Tools & Generation
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'billing'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-purple-50'
              }`}
            >
              💳 Billing & Usage
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'tools' && (
          <>
            {/* Tool Generation Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 mb-8 border border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🛠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Generate New Tool</h2>
          </div>
          
          <PromptForm onSubmit={async (prompt, pluginId) => {
            try {
              console.log('🛠️ Generating tool:', { prompt, pluginId });
              setWobbleMessage("I'm working on your tool! This might take a moment... 🔧");
              
              const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt, pluginId }),
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const tool = await response.json();
              console.log('✅ Tool generated successfully:', tool);
              
              setWobbleMessage("Amazing! Your tool is ready! Check it out below! 🎉");
              
              // Refresh the tools list
              window.location.reload();
              
            } catch (error) {
              console.error('❌ Error generating tool:', error);
              setWobbleMessage("Oops! Something went wrong. Let's try again! 😅");
              alert('Error generating tool. Please try again.');
            }
          }} />
          
          {/* Wobble Tips */}
          <div className="mt-6 bg-purple-50 rounded-2xl p-4 border border-purple-100">
            <div className="flex items-start gap-3">
              <Image 
                src="/images/wobble-characters.png" 
                alt="Wobble Tips" 
                width={32} 
                height={32}
                className="rounded-lg mt-1"
              />
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">💡 Wobble's Tips</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Be specific about what you want your tool to do</li>
                  <li>• Mention any special features or styling you'd like</li>
                  <li>• I can create calculators, games, utilities, and much more!</li>
                  <li>• Try: "Create a tip calculator with dark mode"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Tools */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📦</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Your Tools</h2>
            </div>
            
            <UserToolList onLoad={(tool) => {
              setCurrentTool(tool);
              setWobbleMessage("Here's your tool! You can view it below or embed it anywhere! 🎯");
            }} />
          </div>

          {/* Tool Chains */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🔗</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Tool Chains</h2>
            </div>
            
            <ToolchainComposer tools={[]} onRun={(ids) => {
              // Handle toolchain run
              console.log('Toolchain run:', ids);
            }} />
          </div>
          </>
        )}

        {/* Billing Tab Content */}
        {activeTab === 'billing' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">💳</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Billing & Usage</h2>
            </div>
            
            <BillingDashboard />
          </div>
        )}

        {/* Tool Viewer */}
        {currentTool && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🔍</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Tool Preview</h2>
              </div>
              <button
                onClick={() => setCurrentTool(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
            
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <p className="text-sm text-gray-600">Live Tool Preview</p>
              </div>
              <div className="p-4">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: `${currentTool.html}<script>${currentTool.script}</script>` 
                  }}
                  className="min-h-[200px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Empty State with Wobble */}
        <div className="mt-12 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-purple-100 max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Image 
                  src="/images/wobble-main.png" 
                  alt="Wobble Ready" 
                  width={80} 
                  height={80}
                  className="hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">✨</span>
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Wobble MLP!</h3>
            <p className="text-gray-600 mb-4">
              Start by generating your first tool using the form above.
            </p>
            <p className="text-gray-500 text-sm">
              Describe what you want to build and I'll generate it for you! From simple calculators to complex applications - I'm here to help. 🚀
            </p>
          </div>
        </div>

        {/* Footer with Wobble Heritage */}
        <div className="mt-16 text-center">
          <div className="flex justify-center items-center gap-2 text-gray-500 text-sm">
            <Image 
              src="/images/wobble-main.png" 
              alt="Wobble" 
              width={20} 
              height={20}
              className="rounded-full opacity-70"
            />
            <p>Powered by Wobble AI • From browser pet to your personal tool builder</p>
          </div>
        </div>
      </div>
    </div>
  );
}

