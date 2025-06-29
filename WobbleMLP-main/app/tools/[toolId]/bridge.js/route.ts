import { NextResponse } from 'next/server'

export async function GET() {
  const js = `window.parent.postMessage({type:'ready'}, '*');`
  return new NextResponse(js, {
    headers: {
      'content-type': 'application/javascript',
    },
  })
}
