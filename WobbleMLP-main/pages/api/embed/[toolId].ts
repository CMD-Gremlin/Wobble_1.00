import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verify } from '@/lib/billing/signUrl'

export const config = { runtime: 'edge' }

export default async function handler(req: NextRequest) {
  const url = new URL(req.url)
  const toolId = url.pathname.split('/').pop() || ''
  const ver = parseInt(url.searchParams.get('v') || '0', 10)
  const sig = url.searchParams.get('sig') || ''

  if (!verify(toolId, ver, sig)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase.storage
    .from('tools')
    .createSignedUrl(`${toolId}/${ver}/index.html`, 60)

  if (error || !data?.signedUrl) {
    return new NextResponse('Version not found', { status: 403 })
  }

  const res = NextResponse.redirect(data.signedUrl)
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'"
  )
  return res
}
