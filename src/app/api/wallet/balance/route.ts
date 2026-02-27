import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { balanceCents, pendingCents } = await db.wallets.getBalance(user.id)
    return NextResponse.json({ balance_cents: balanceCents, pending_cents: pendingCents })
  } catch (err) {
    console.error('wallet/balance error:', err)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}
