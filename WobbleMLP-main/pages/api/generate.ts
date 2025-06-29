// pages/api/generate.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { aiGenerateTool } from '@/lib/aiGenerate'
import { getVecStorePromise } from '@/lib/vectorStore'
import { chunk } from '@/lib/chunker'
import { createServerClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt, pluginId } = req.body
  try {
    const supabase = createServerClient()
    const { data } = await supabase.auth.getUser()
    const user = data.user
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    let plugin
    if (pluginId) {
      const { data: p } = await supabase
        .from('ai_plugins')
        .select('*')
        .eq('id', pluginId)
        .single()
      plugin = p || undefined
    }

    // 1️⃣ Generate and store new tool instance
    const tool = await aiGenerateTool(prompt, supabase as unknown as SupabaseClient<Database>, user.id, plugin)
    //   tool === { id, tool_name, html, script }

    // 3️⃣ Build a single HTML+<script> blob for vector storage
    const allCode = `${tool.html}\n<script>\n${tool.script}\n</script>`
    const chunks = chunk(allCode)
    const docs = chunks.map(c => ({
      id: c.id,
      pageContent: c.code,
      metadata: c.meta,
    }))
    const ids = docs.map(d => d.id)

    // 4️⃣ Insert into your vector store
    const vecStore = await getVecStorePromise()
    await vecStore.addDocuments(docs, { ids })

    // 5️⃣ Return the generated tool
    return res.status(200).json({
      id: tool.id,
      tool_name: tool.tool_name,
      html: tool.html,
      script: tool.script,
    })
  } catch (err: any) {
    console.error('🎯 generate error:', err)
    return res.status(500).json({ error: err.message })
  }
}
