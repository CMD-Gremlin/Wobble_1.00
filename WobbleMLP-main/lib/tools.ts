import type { SupabaseClient } from '@supabase/ssr'

export async function saveTool(
  supabase: SupabaseClient,
  user_id: string,
  tool_name: string,
  html: string,
  script: string,
  options?: { visibility?: 'private' | 'unlisted' | 'public'; price?: number; paid_only?: boolean }
) {
  let toolId: string | undefined
  const { data: existing } = await supabase
    .from('tools')
    .select('id')
    .eq('user_id', user_id)
    .eq('name', tool_name)
    .single()

  const columns = {
    html,
    script,
    visibility: options?.visibility ?? 'private',
    price: options?.price ?? 0,
    paid_only: options?.paid_only ?? false,
  }

  if (existing) {
    toolId = existing.id
    const { error } = await supabase.from('tools').update(columns).eq('id', toolId)
    if (error) throw error
  } else {
    const { data, error } = await supabase
      .from('tools')
      .insert({ user_id, name: tool_name, ...columns })
      .select('id')
      .single()
    if (error) throw error
    toolId = data!.id
  }

  const { error: verErr } = await supabase
    .from('tool_versions')
    .insert({ tool_id: toolId, html, script })
  if (verErr) throw verErr

  return toolId
}

export async function getUserTools(supabase: SupabaseClient, user_id: string) {
  const { data, error } = await supabase
    .from('tools')
    .select('id, name, updated_at')
    .eq('user_id', user_id)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getToolById(supabase: SupabaseClient, tool_id: string) {
  const { data, error } = await supabase
    .from('tools')
    .select('html, script, paid_only, price')
    .eq('id', tool_id)
    .single()
  if (error) throw error
  return data
}

export async function getPublicToolById(
  supabase: SupabaseClient,
  tool_id: string
) {
  const { data, error } = await supabase
    .from('tools')
    .select('html, script, visibility, paid_only, price')
    .eq('id', tool_id)
    .single()
  if (error) throw error
  if (!data || data.visibility === 'private') {
    throw new Error('Not public')
  }
  return data
}

export async function getToolVersions(supabase: SupabaseClient, tool_id: string) {
  const { data, error } = await supabase
    .from('tool_versions')
    .select('id, html, script, created_at')
    .eq('tool_id', tool_id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
