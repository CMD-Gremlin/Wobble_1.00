import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Readable } from 'stream';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export class StripeWebhookHandler {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16' as any,
    });
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  }

  async handleWebhook(req: any, res: any) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).end('Method Not Allowed');
    }

    const sig = req.headers['stripe-signature'] as string;
    if (!sig) {
      return res.status(400).send('Missing Stripe signature');
    }

    try {
      const buffer = await this.readStream(req);
      const event = this.stripe.webhooks.constructEvent(
        buffer.toString(),
        sig,
        this.webhookSecret
      );

      await this.handleEvent(event);
      return res.status(200).json({ received: true });
    } catch (err: any) {
      console.error('Webhook error:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  private async readStream(req: any): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  private async handleEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event);
        break;
      case 'payment_method.attached':
        await this.handlePaymentMethodAttached(event);
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }

  private async handlePaymentIntentSucceeded(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    // Handle successful payment
    console.log('PaymentIntent succeeded:', paymentIntent);
  }

  private async handlePaymentMethodAttached(event: Stripe.Event) {
    const paymentMethod = event.data.object as Stripe.PaymentMethod;
    // Handle attached payment method
    console.log('PaymentMethod attached:', paymentMethod);
  }
}

export default StripeWebhookHandler;
