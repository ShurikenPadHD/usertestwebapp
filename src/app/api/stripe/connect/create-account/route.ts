import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await db.profiles.findById(user.id)
    const role = (profile as { role?: string } | null)?.role
    // #region agent log
    fetch('http://127.0.0.1:7470/ingest/6f3c770d-a54a-4d4c-827d-876e5cf3453c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'61fe6f'},body:JSON.stringify({sessionId:'61fe6f',location:'create-account/route.ts:role-check',message:'create-account auth check',data:{userId:user.id,profileExists:!!profile,role:role??'undefined'},hypothesisId:'H1-H3',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (role !== 'tester') {
      return NextResponse.json({ error: 'Only testers can set up payout accounts' }, { status: 403 })
    }

    let stripeAccountId = (profile as { stripe_account_id?: string } | null)?.stripe_account_id

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
      stripeAccountId = account.id
      await db.profiles.updateStripeAccountId(user.id, stripeAccountId)
    }

    return NextResponse.json({ account_id: stripeAccountId })
  } catch (err) {
    console.error('stripe/connect/create-account error:', err)
    const stripeErr = err as { type?: string; message?: string; raw?: { message?: string } }
    const msg = stripeErr?.raw?.message ?? stripeErr?.message
    if (typeof msg === 'string' && msg.includes('Connect')) {
      return NextResponse.json(
        { error: 'Stripe Connect is not enabled. Enable it in Stripe Dashboard → Settings → Connect.' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: msg ?? 'Failed to create payout account' }, { status: 500 })
  }
}
