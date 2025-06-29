import { createHmac } from 'crypto'

export function sign(toolId: string, ver: number) {
  return createHmac('sha256', process.env.EMBED_SECRET!)
    .update(`${toolId}|${ver}`)
    .digest('hex')
}

export function verify(toolId: string, ver: number, sig: string) {
  return sig === sign(toolId, ver)
}
