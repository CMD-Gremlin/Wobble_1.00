'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabaseClient'

interface PlanInfo {
  tier: string
  renews_at: string
  stripe_customer?: string
}

interface UsageInfo {
  plan: string
  remaining: number
  used: number
  limit: number
  low?: boolean
}

export default function BillingDashboard() {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchBillingInfo()
  }, [])

  const fetchBillingInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch plan info
      const { data: plan } = await supabase
        .from('plans')
        .select('tier, renews_at, stripe_customer')
        .eq('user_id', user.id)
        .single()

      setPlanInfo(plan || { tier: 'free', renews_at: new Date().toISOString() })

      // Fetch usage info
      const tier = plan?.tier || 'free'
      const limits = { free: 100000, pro: 1000000, tiny: 1 }
      const limit = limits[tier as keyof typeof limits] || limits.free

      const since = plan?.renews_at || '1970-01-01'
      const { data: usage } = await supabase
        .from('usage')
        .select('prompt_tokens, completion_tokens')
        .eq('user_id', user.id)
        .gte('created_at', since)

      let used = 0
      usage?.forEach(u => {
        used += (u.prompt_tokens || 0) + (u.completion_tokens || 0)
      })

      setUsageInfo({
        plan: tier,
        remaining: limit - used,
        used,
        limit,
        low: (limit - used) / limit < 0.2
      })

    } catch (error) {
      console.error('Failed to fetch billing info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' })
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Failed to upgrade:', error)
      alert('Failed to start upgrade process. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 mx-auto mb-4">
          <img 
            src="/images/wobble-main.svg" 
            alt="Loading" 
            className="w-8 h-8 animate-spin"
          />
        </div>
        <p className="text-gray-600">Loading billing information...</p>
      </div>
    )
  }

  const usagePercentage = usageInfo ? (usageInfo.used / usageInfo.limit) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
            <p className="text-sm text-gray-600">
              {planInfo?.tier === 'free' ? 'Free Tier' : 
               planInfo?.tier === 'pro' ? 'Pro Plan' : 
               planInfo?.tier?.toUpperCase() || 'Unknown'}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            planInfo?.tier === 'pro' ? 'bg-purple-100 text-purple-800' :
            planInfo?.tier === 'free' ? 'bg-gray-100 text-gray-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {planInfo?.tier?.toUpperCase() || 'FREE'}
          </div>
        </div>

        {planInfo?.renews_at && (
          <p className="text-sm text-gray-500">
            {planInfo.tier === 'free' ? 'Usage resets' : 'Renews'} on{' '}
            {new Date(planInfo.renews_at).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Usage Information */}
      {usageInfo && (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Usage</h3>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Used this period</span>
              <span className="font-medium">
                {usageInfo.used.toLocaleString()} / {usageInfo.limit.toLocaleString()} tokens
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  usageInfo.low ? 'bg-red-500' : 
                  usagePercentage > 70 ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                {usageInfo.remaining.toLocaleString()} tokens remaining
              </p>
              {usageInfo.low && (
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Running low on tokens
                </p>
              )}
            </div>
            
            {planInfo?.tier === 'free' && (
              <button
                onClick={handleUpgrade}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Upgrade Plan
              </button>
            )}
          </div>
        </div>
      )}

      {/* Plan Features */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Free Plan</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ 100,000 tokens/month</li>
              <li>✅ Basic tool generation</li>
              <li>✅ Public tool sharing</li>
              <li>❌ Priority support</li>
              <li>❌ Advanced features</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Pro Plan</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ 1,000,000 tokens/month</li>
              <li>✅ Advanced tool generation</li>
              <li>✅ Private tools</li>
              <li>✅ Priority support</li>
              <li>✅ Custom domains</li>
            </ul>
          </div>
        </div>

        {planInfo?.tier === 'free' && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <img 
                src="/images/wobble-main.svg" 
                alt="Wobble" 
                className="w-8 h-8"
              />
              <div>
                <p className="font-medium text-purple-800">Ready to build more?</p>
                <p className="text-sm text-purple-600">
                  Upgrade to Pro for 10x more tokens and advanced features!
                </p>
              </div>
              <button
                onClick={handleUpgrade}
                className="ml-auto bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

