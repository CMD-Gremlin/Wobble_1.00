import { supabaseServer } from '@/lib/supabaseClient'

interface Tokens {
  prompt?: number
  completion?: number
}

interface UsageOpts {
  toolId: string
  userId?: string
  tokens?: Tokens
}

export async function recordUsage(req: any, { toolId, userId, tokens }: UsageOpts) {
  let uid = userId
  if (!uid) {
    const { data } = await supabaseServer(req.cookies).auth.getUser()
    uid = data.user?.id
  }
  if (!uid) return
  await supabaseServer(req.cookies)
    .from('usage')
    .insert({
      user_id: uid,
      tool_id: toolId,
      prompt_tokens: tokens?.prompt,
      completion_tokens: tokens?.completion,
    })
}
