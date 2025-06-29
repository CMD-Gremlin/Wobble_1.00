import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/billing/stripe'
import { createServerClient } from '@/lib/supabase/server'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { plan } = req.body

    // Define plan pricing
    const planPrices = {
      pro: 'price_1234567890', // Replace with actual Stripe price ID
      // Add more plans as needed
    }

    if (!planPrices[plan as keyof typeof planPrices]) {
      return res.status(400).json({ error: 'Invalid plan' })
    }

    // Check if customer already exists
    let customerId: string | undefined
    const { data: existingPlan } = await supabase
      .from('plans')
      .select('stripe_customer')
      .eq('user_id', user.id)
      .single()

    if (existingPlan?.stripe_customer) {
      customerId = existingPlan.stripe_customer
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      })
      customerId = customer.id
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: planPrices[plan as keyof typeof planPrices],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/dashboard`,
      metadata: {
        user_id: user.id,
        plan: plan,
      },
    })

    return res.status(200).json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return res.status(500).json({ error: error.message })
  }
}

