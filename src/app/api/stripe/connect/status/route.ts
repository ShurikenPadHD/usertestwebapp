import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await db.profiles.findById(user.id) as {
      stripe_account_id?: string
      trust_level?: string
      completed_tasks_count?: number
    } | null

    return NextResponse.json({
      hasPayoutMethod: !!profile?.stripe_account_id,
      trust_level: profile?.trust_level ?? 'new',
      completed_tasks_count: profile?.completed_tasks_count ?? 0,
    })
  } catch (err) {
    console.error('stripe/connect/status error:', err)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}
