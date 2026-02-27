import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await db.profiles.findById(user.id)
    const stripeAccountId = (profile as { stripe_account_id?: string } | null)?.stripe_account_id
    // #region agent log
    fetch('http://127.0.0.1:7470/ingest/6f3c770d-a54a-4d4c-827d-876e5cf3453c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'61fe6f'},body:JSON.stringify({sessionId:'61fe6f',location:'account-link/route.ts:stripe-check',message:'account-link stripe_account_id',data:{userId:user.id,hasStripeAccountId:!!stripeAccountId},hypothesisId:'H4',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!stripeAccountId) {
      return NextResponse.json(
        { error: 'No payout account. Create one first via create-account.' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const returnPath = (body as { return_path?: string })?.return_path ?? '/tester/earnings'

    let origin = request.headers.get('origin') ?? request.headers.get('x-forwarded-host') ?? 'http://localhost:3000'
    let baseUrl = origin.startsWith('http') ? origin : `https://${origin}`
    if (baseUrl.includes('localhost')) {
      baseUrl = baseUrl.replace(/^https:/, 'http:')
    }
    const basePath = returnPath.startsWith('/') ? returnPath : `/${returnPath}`
    const returnUrl = `${baseUrl}${basePath}`
    const refreshUrl = `${baseUrl}${basePath}${basePath.includes('?') ? '&' : '?'}refresh=1`

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (err) {
    console.error('stripe/connect/account-link error:', err)
    return NextResponse.json({ error: 'Failed to create account link' }, { status: 500 })
  }
}
