import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      if (!userId) {
        return NextResponse.json({ error: 'Missing user_id in metadata' }, { status: 400 })
      }
      const amountTotal = session.amount_total ?? 0
      if (amountTotal <= 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
      }
      await db.wallets.deposit(userId, amountTotal, {
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
      })
      if (session.customer && typeof session.customer === 'string') {
        const profile = await db.profiles.findById(userId)
        if (profile && !(profile as { stripe_customer_id?: string }).stripe_customer_id) {
          await db.profiles.updateStripeCustomerId(userId, session.customer)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error'
    console.error('Stripe webhook error:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
