import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest, { params }: { params: { toolId: string } }) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
  const { data } = await supabase
    .from('tools')
    .select('html, script')
    .eq('id', params.toolId)
    .single()
  let html = data?.html || "<input id='msg'><button onclick=send()>Echo</button><pre id='out'></pre>"
  let script = data?.script || "function send(){const v=document.getElementById('msg').value;document.getElementById('out').textContent=v;window.parent.postMessage({type:'echo',value:v},'*')}"

  const body = `<!DOCTYPE html>\n<html>\n<head>\n<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'unsafe-inline'">\n</head>\n<body>\n${html}\n<script src="./bridge.js"></script>\n<script>\n${script}\n</script>\n</body>\n</html>`

  return new NextResponse(body, {
    headers: {
      'content-type': 'text/html',
    },
  })
}
