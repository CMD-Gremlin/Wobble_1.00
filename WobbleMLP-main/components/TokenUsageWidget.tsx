'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabaseClient'

interface TokenUsage {
  used: number
  limit: number
  remaining: number
  plan: string
  low: boolean
}

export default function TokenUsageWidget() {
  const [usage, setUsage] = useState<TokenUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch plan info
      const { data: plan } = await supabase
        .from('plans')
        .select('tier, renews_at')
        .eq('user_id', user.id)
        .single()

      const tier = plan?.tier || 'free'
      const limits = { free: 100000, pro: 1000000, tiny: 1 }
      const limit = limits[tier as keyof typeof limits] || limits.free

      // Fetch usage
      const since = plan?.renews_at || '1970-01-01'
      const { data: usageData } = await supabase
        .from('usage')
        .select('prompt_tokens, completion_tokens')
        .eq('user_id', user.id)
        .gte('created_at', since)

      let used = 0
      usageData?.forEach(u => {
        used += (u.prompt_tokens || 0) + (u.completion_tokens || 0)
      })

      const remaining = limit - used
      setUsage({
        used,
        limit,
        remaining,
        plan: tier,
        low: remaining / limit < 0.2
      })

    } catch (error) {
      console.error('Failed to fetch usage:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-purple-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 animate-spin">
            <img src="/images/wobble-main.svg" alt="Loading" className="w-4 h-4" />
          </div>
          <span className="text-sm text-gray-600">Loading usage...</span>
        </div>
      </div>
    )
  }

  if (!usage) return null

  const percentage = (usage.used / usage.limit) * 100

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-purple-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Token Usage</span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          usage.plan === 'pro' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {usage.plan.toUpperCase()}
        </span>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{usage.used.toLocaleString()}</span>
          <span>{usage.limit.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              usage.low ? 'bg-red-500' : 
              percentage > 70 ? 'bg-yellow-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">
          {usage.remaining.toLocaleString()} remaining
        </span>
        {usage.low && (
          <span className="text-xs text-red-600 font-medium">
            ⚠️ Low
          </span>
        )}
      </div>
    </div>
  )
}

