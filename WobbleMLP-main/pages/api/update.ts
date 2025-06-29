// pages/api/update.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { aiGenerate } from '../../lib/aiGenerate'
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

  const { toolId, userRequest } = req.body

  // 1️⃣ Fetch the current html/script
  const { data, error: fetchError } = await supabase
    .from('tools')
    .select('html, script')
    .eq('id', toolId)
    .single()

  if (fetchError || !data) {
    return res.status(404).json({ error: 'Tool not found' })
  }

  const { html: oldHtml, script: oldScript } = data

  // 2️⃣ Build a prompt that asks for STRICT JSON
  const patchPrompt = `
You are a code assistant.  
Here is the existing HTML and JavaScript:

${oldHtml}
<script>
${oldScript}
</script>

The user wants to make this change: "${userRequest}"

**Please respond with valid JSON only**, with exactly two fields:
{
  "html": "...",   // the updated HTML fragment
  "script": "..."  // the updated JS, without <script> tags
}
  `.trim()

  // 3️⃣ Ask the AI to patch it
  const aiResult = await aiGenerate(patchPrompt)
  console.log('AI raw output:', aiResult)

  // 4️⃣ Try to extract html & script
  let newHtml: string | undefined
  let newScript: string | undefined

  // If aiResult is already an object with html & script:
  if (typeof aiResult === 'object' && 'html' in aiResult && 'script' in aiResult) {
    newHtml   = (aiResult as any).html
    newScript = (aiResult as any).script
  } 
  // If aiResult is a string, try parsing JSON out of it:
  else if (typeof aiResult === 'string') {
    try {
      // Attempt a direct parse
      const parsed = JSON.parse(aiResult)
      newHtml   = parsed.html
      newScript = parsed.script
    } catch {
      // Fallback: extract the first JSON substring
      const match = aiResult.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          const parsed = JSON.parse(match[0])
          newHtml   = parsed.html
          newScript = parsed.script
        } catch (e) {
          console.error('JSON fallback parse failed:', e)
        }
      }
    }
  }

  if (!newHtml || !newScript) {
    console.error('⛔ Could not extract html/script from AI result')
    return res.status(500).json({ error: 'AI returned invalid patch' })
  }

  // 5️⃣ Persist the patched code
  const { error: updateError } = await supabase
    .from('tools')
    .update({ html: newHtml, script: newScript })
    .eq('id', toolId)

  if (updateError) {
    return res.status(500).json({ error: updateError.message })
  }

  // 6️⃣ Return the combined blob
  const patched = `${newHtml}\n<script>\n${newScript}\n</script>`
  return res.status(200).json({ patched })
}
