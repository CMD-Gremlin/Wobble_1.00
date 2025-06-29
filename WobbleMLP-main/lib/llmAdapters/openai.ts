import OpenAI from 'openai'

export async function chat({ key, model, messages }: { key: string; model: string; messages: any[] }) {
  const client = new OpenAI({ apiKey: key })
  const res = await client.chat.completions.create({ model, messages })
  const result = res.choices?.[0]?.message?.content ?? ''
  return { result, usage: res.usage }
}
