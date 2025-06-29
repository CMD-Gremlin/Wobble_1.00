import OpenAI from 'openai'
import type { SupabaseClient } from '@supabase/supabase-js'
import { saveTool } from './tools'
import type { AIPlugin } from './plugins'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })


export async function aiGenerate(prompt: string, plugin?: AIPlugin) {
  const pluginInfo = plugin
    ? `You can call an external API named ${plugin.name}. Description: ${plugin.description}. Endpoint: ${plugin.api_url} using ${plugin.method}. The input JSON schema is ${JSON.stringify(
        plugin.input_schema
      )}. The output JSON schema is ${JSON.stringify(plugin.output_schema)}.`
    : ''
  const instruction = `
You are a code generator for Wobble micro‑apps.
${pluginInfo}
Input: "${prompt}"
Output: JSON with keys "tool_name", "html", "script". JSON only.
`
  const res = await openai.chat.completions.create({
    model: 'gpt-4.1-2025-04-14',
    messages: [{ role: 'system', content: instruction }],
    temperature: 0,
  })

  const content = res.choices[0].message.content
  if (!content) throw new Error('AI returned no content')
  const text = content.trim()
  try {
    return JSON.parse(text)
  } catch (e) {
    throw new Error('AI returned invalid JSON: ' + text)
  }
}

export async function aiGenerateTool(
  prompt: string,
  supabase: SupabaseClient,
  userId: string,
  plugin?: AIPlugin
) {
  const generated = await aiGenerate(prompt, plugin)
  const id = await saveTool(supabase, userId, generated.tool_name, generated.html, generated.script, {
    visibility: 'private',
  })
  return { id, ...generated }
}
