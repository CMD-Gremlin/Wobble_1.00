import type { NextApiRequest, NextApiResponse } from 'next'
import adapters from '@/lib/llmAdapters'
import { getKeyFor } from '@/lib/credentials'
import { checkQuota } from '@/lib/policy'
import { createServerClient } from '@/lib/supabase/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { provider = 'openai', model, messages, toolId = provider } = req.body || {}
  if (!model || !messages) {
    return res.status(400).json({ error: 'Missing model or messages' })
  }

  try {
    await checkQuota(req, provider, model)
    const key = getKeyFor(req, provider)
    const { result, usage } = await adapters[provider].chat({ key, model, messages })
    const tokens = {
      prompt: usage?.prompt_tokens,
      completion: usage?.completion_tokens,
    }
    const { data } = await createServerClient().auth.getUser()
    const quota = await checkQuota(req, provider, model, {
      toolId,
      userId: data.user?.id,
      tokens,
    })
    if (quota) {
      res.setHeader('X-Wobble-Plan', JSON.stringify({ plan: quota.plan, remaining: quota.remaining }))
      if (quota.low) res.setHeader('X-Wobble-Quota', 'low')
    }
    console.log('[TOOL-PROXY]', provider, model, usage?.prompt_tokens ?? '-')
    return res.status(200).json({ result, usage })
  } catch (err: any) {
    const status = err.status || 500
    return res.status(status).json({ error: err.message })
  }
}
