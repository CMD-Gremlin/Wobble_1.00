import { createServerClient } from './supabase/server'

export async function getUser() {
  const supa = createServerClient()
  const { data } = await supa.auth.getUser()
  return data.user
}
