import type { NextApiRequest, NextApiResponse } from 'next'
import { chunk } from '@/lib/chunker'
import { getVecStorePromise } from '@/lib/vectorStore'
import { createServerClient } from '@/lib/supabase/server'


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabase = createServerClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { toolId } = req.body
  if (!toolId) return res.status(400).json({ error: 'toolId is required' })

  try {
    const { data, error } = await supabase
      .from('tools')
      .select('html, script')
      .eq('id', toolId)
      .single()
    if (error || !data) throw error || new Error('Tool not found')

    const allCode = `${data.html}\n<script>\n${data.script}\n</script>`
    const ids = chunk(allCode).map(c => c.id)

    const vecStore = await getVecStorePromise()
    await vecStore.delete({ ids })

    const { error: delError } = await supabase
      .from('tools')
      .delete()
      .eq('id', toolId)
    if (delError) throw delError

    return res.status(200).json({ success: true })
  } catch (err: any) {
    console.error('delete error:', err)
    return res.status(500).json({ error: err.message })
  }
}
