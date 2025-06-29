import type { SupabaseClient } from '@supabase/ssr'

export type AIPlugin = {
  id: string
  name: string
  description: string | null
  api_url: string
  input_schema: any
  output_schema: any
  method: string
  visibility: 'public' | 'private'
  created_by: string
  created_at: string
  updated_at: string
}

export async function createPlugin(
  supabase: SupabaseClient,
  plugin: Omit<AIPlugin, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('ai_plugins')
    .insert(plugin)
    .select('id')
    .single()
  if (error) throw error
  return data!.id as string
}

export async function listPlugins(
  supabase: SupabaseClient,
  visibility?: 'public' | 'private'
) {
  let query = supabase.from('ai_plugins').select('*')
  if (visibility) query = query.eq('visibility', visibility)
  const { data, error } = await query
  if (error) throw error
  return data as AIPlugin[]
}

export async function getPluginById(
  supabase: SupabaseClient,
  id: string
) {
  const { data, error } = await supabase
    .from('ai_plugins')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as AIPlugin
}
