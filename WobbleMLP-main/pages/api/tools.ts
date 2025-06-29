import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerClient } from '@/lib/supabase/server'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabase = createServerClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const id = typeof req.query.id === 'string' ? req.query.id : undefined

  if (id) {
    const { data, error } = await supabase
      .from('tools')
      .select('name, html, script, updated_at')
      .eq('id', id)
      .single()
    if (error || !data) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(data)
  } else {
    const { data, error } = await supabase
      .from('tools')
      .select('id, name, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }
}
