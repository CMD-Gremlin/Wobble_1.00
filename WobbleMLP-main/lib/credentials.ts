import type { NextApiRequest } from 'next'

export function getKeyFor(req: NextApiRequest, provider: string): string {
  const header = req.headers['x-api-key']
  if (typeof header === 'string' && header.trim()) return header.trim()

  switch (provider) {
    case 'openai':
      return process.env.OPENAI_API_KEY || ''
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY || ''
    case 'mistral':
      return process.env.MISTRAL_API_KEY || ''
    default:
      return ''
  }
}
