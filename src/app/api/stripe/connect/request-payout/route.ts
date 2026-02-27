import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const MIN_PAYOUT_CENTS = 100 // $1 minimum

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await db.profiles.findById(user.id)
    const stripeAccountId = (profile as { stripe_account_id?: string } | null)?.stripe_account_id
    if (!stripeAccountId) {
      return NextResponse.json(
        { error: 'Add a payout method first' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const amountCents = Number(body?.amount_cents ?? 0)
    if (amountCents < MIN_PAYOUT_CENTS) {
      return NextResponse.json(
        { error: `Minimum payout is $${MIN_PAYOUT_CENTS / 100}` },
        { status: 400 }
      )
    }

    await db.wallets.debitForPayout(user.id, amountCents)

    await stripe.transfers.create({
      amount: amountCents,
      currency: 'usd',
      destination: stripeAccountId,
      metadata: { user_id: user.id },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payout failed'
    if (message === 'Insufficient balance') {
      return NextResponse.json({ error: message }, { status: 400 })
    }
    console.error('stripe/connect/request-payout error:', err)
    return NextResponse.json({ error: 'Failed to process payout' }, { status: 500 })
  }
}
