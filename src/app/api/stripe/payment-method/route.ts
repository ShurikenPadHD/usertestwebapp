import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await db.profiles.findById(user.id)
    const customerId = profile?.stripe_customer_id as string | null | undefined
    if (!customerId) {
      return NextResponse.json({ paymentMethod: null })
    }

    const customer = await stripe.customers.retrieve(customerId, {
      expand: ['invoice_settings.default_payment_method'],
    })
    if (customer.deleted) {
      return NextResponse.json({ paymentMethod: null })
    }

    const pm = (customer as Stripe.Customer).invoice_settings?.default_payment_method
    const method = typeof pm === 'object' && pm?.object === 'payment_method'
      ? (pm as Stripe.PaymentMethod)
      : typeof pm === 'string'
        ? await stripe.paymentMethods.retrieve(pm)
        : null

    if (!method || method.object !== 'payment_method') {
      return NextResponse.json({ paymentMethod: null })
    }

    const card = method.card
    return NextResponse.json({
      paymentMethod: {
        brand: card?.brand ?? 'card',
        last4: card?.last4 ?? '',
      },
    })
  } catch (err) {
    console.error('payment-method error:', err)
    return NextResponse.json({ error: 'Failed to fetch payment method' }, { status: 500 })
  }
}
