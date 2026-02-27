import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function getDefaultPaymentMethod(customerId: string): Promise<{ brand: string; last4: string } | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId, {
      expand: ['invoice_settings.default_payment_method'],
    })
    if (customer.deleted) return null
    const pm = (customer as Stripe.Customer).invoice_settings?.default_payment_method
    const method = typeof pm === 'object' && pm?.object === 'payment_method'
      ? (pm as Stripe.PaymentMethod)
      : typeof pm === 'string'
        ? await stripe.paymentMethods.retrieve(pm)
        : null
    if (!method || method.object !== 'payment_method' || !method.card) return null
    return {
      brand: method.card.brand ?? 'card',
      last4: method.card.last4 ?? '',
    }
  } catch {
    return null
  }
}
