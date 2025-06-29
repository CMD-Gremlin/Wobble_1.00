import Ajv from 'ajv'
import type { SupabaseClient } from '@supabase/ssr'
import { getPluginById } from './plugins'

export async function executePlugin(
  supabase: SupabaseClient,
  pluginId: string,
  payload: any
) {
  const plugin = await getPluginById(supabase, pluginId)

  const ajv = new Ajv()
  const validateInput = ajv.compile(plugin.input_schema)
  if (!validateInput(payload)) {
    throw new Error('Invalid payload for plugin')
  }

  const res = await fetch(plugin.api_url, {
    method: plugin.method,
    headers: { 'Content-Type': 'application/json' },
    ...(plugin.method === 'POST' ? { body: JSON.stringify(payload) } : {}),
  })

  if (!res.ok) {
    throw new Error(`Plugin request failed: ${res.status}`)
  }

  const data = await res.json()
  const validateOutput = ajv.compile(plugin.output_schema)
  if (!validateOutput(data)) {
    throw new Error('Plugin returned invalid response')
  }

  return data
}
