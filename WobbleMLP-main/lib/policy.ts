import type { NextApiRequest } from 'next'
import { supabaseServer } from './supabaseClient'
import { recordUsage } from './billing/recordUsage'

type Bucket = { start: number; count: number }
const buckets = new Map<string, Bucket>()
const WINDOW = 60_000
const LIMIT = 10

const PLAN_LIMITS: Record<string, number> = {
  free: 100000,
  pro: 1000000,
  tiny: 1,
}

export interface QuotaInfo {
  plan: string
  remaining: number
  low?: boolean
}

export async function checkQuota(
  req: NextApiRequest,
  _provider: string,
  _model: string,
  usage?: {
    toolId: string
    userId?: string
    tokens?: { prompt?: number; completion?: number }
  }
): Promise<QuotaInfo | undefined> {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown'
  const now = Date.now()
  const bucket = buckets.get(ip)
  if (bucket && now - bucket.start < WINDOW) {
    bucket.count += 1
    if (bucket.count > LIMIT) {
      const err = new Error('Too many requests') as any
      err.status = 429
      throw err
    }
  } else {
    buckets.set(ip, { start: now, count: 1 })
  }

  let info: QuotaInfo | undefined

  if (usage) {
    const supa = supabaseServer((req as any).cookies)
    const { data: auth } = await supa.auth.getUser()
    const uid = usage.userId || auth.user?.id
    if (uid) {
      const { data: plan } = await supa
        .from('plans')
        .select('tier, renews_at')
        .eq('user_id', uid)
        .single()
      const tier = plan?.tier || 'free'
      const limit = PLAN_LIMITS[tier] ?? PLAN_LIMITS.free
      const since = plan?.renews_at || '1970-01-01'
      const { data: rows } = await supa
        .from('usage')
        .select('prompt_tokens, completion_tokens')
        .eq('user_id', uid)
        .gte('ts', since)
      let used = 0
      rows?.forEach(r => {
        used += (r.prompt_tokens || 0) + (r.completion_tokens || 0)
      })
      const tokensNow =
        (usage.tokens?.prompt || 0) + (usage.tokens?.completion || 0)
      const remaining = limit - used - tokensNow
      info = { plan: tier, remaining, low: remaining / limit < 0.2 }
      await recordUsage(req, { ...usage, userId: uid })
      if (remaining < 0) {
        const err = new Error('quota exceeded') as any
        err.status = 429
        throw err
      }
    } else {
      await recordUsage(req, usage)
    }
  }

  return info
}
