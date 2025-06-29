import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/billing/stripe'
import { createClient } from '@supabase/supabase-js'
import { Readable } from 'stream'

export const config = { api: { bodyParser: false } }

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const sig = req.headers['stripe-signature'] as string
  const chunks: Uint8Array[] = []
  for await (const chunk of req as Readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const buf = Buffer.concat(chunks)
  let event: any
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'customer.subscription.created') {
    const sub = event.data.object as any
    const customer = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
    const userId = sub.metadata?.user_id
    if (userId && customer) {
      await supabase.from('plans').upsert({
        user_id: userId,
        stripe_customer: customer,
        tier: 'paid',
        renews_at: new Date().toISOString(),
      })
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    const inv = event.data.object as any
    const customer = typeof inv.customer === 'string' ? inv.customer : inv.customer.id
    await supabase
      .from('plans')
      .update({ renews_at: new Date().toISOString() })
      .eq('stripe_customer', customer)
  }

  res.json({ received: true })
}
