import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const MIN_AMOUNT_CENTS = 500 // $5

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const amountCents = Number(body?.amount_cents ?? 0)
    if (amountCents < MIN_AMOUNT_CENTS) {
      return NextResponse.json(
        { error: `Minimum amount is $${MIN_AMOUNT_CENTS / 100}` },
        { status: 400 }
      )
    }

    const origin = request.headers.get('origin') ?? request.headers.get('x-forwarded-host') ?? 'http://localhost:3000'
    const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`

    const profile = await db.profiles.findById(user.id)
    const stripeCustomerId = (profile as { stripe_customer_id?: string } | null)?.stripe_customer_id

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Add funds to wallet' },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dev/payments?success=1`,
      cancel_url: `${baseUrl}/dev/payments?canceled=1`,
      metadata: { user_id: user.id },
      payment_intent_data: { setup_future_usage: 'off_session' },
    }
    if (stripeCustomerId) {
      sessionParams.customer = stripeCustomerId
    } else {
      sessionParams.customer_email = user.email ?? undefined
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('create-checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
