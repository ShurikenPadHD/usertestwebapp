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

    let profile = await db.profiles.findById(user.id)
    let customerId = profile?.stripe_customer_id as string | null | undefined

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      })
      customerId = customer.id
      await db.profiles.updateStripeCustomerId(user.id, customerId)
    }

    const origin = request.headers.get('origin') ?? request.headers.get('x-forwarded-host') ?? 'http://localhost:3000'
    let baseUrl = origin.startsWith('http') ? origin : `https://${origin}`
    // Force HTTP for localhost (dev server has no SSL → ERR_SSL_PROTOCOL_ERROR)
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
      baseUrl = baseUrl.replace(/^https:/, 'http:')
    }
    const returnUrl = `${baseUrl}/auth/stripe-return?next=/dev/payments`

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('create-portal-session error:', err)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
