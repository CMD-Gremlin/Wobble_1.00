import type { SupabaseClient } from '@supabase/ssr'

export async function createToolchain(
  supabase: SupabaseClient,
  user_id: string,
  name: string,
  tool_ids: string[]
) {
  const { data, error } = await supabase
    .from('toolchains')
    .insert({ user_id, name, nodes: tool_ids })
    .select('id')
    .single()
  if (error) throw error
  return data!.id as string
}

export async function getToolchainById(
  supabase: SupabaseClient,
  chain_id: string
) {
  const { data, error } = await supabase
    .from('toolchains')
    .select('id, name, nodes')
    .eq('id', chain_id)
    .single()
  if (error) throw error
  return data
}
