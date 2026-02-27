import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const role = searchParams.get('role') ?? 'tester' // developer | tester

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  if (data.user) {
    const admin = createAdminClient()
    // Ensure profile has correct role (trigger defaults to 'tester')
    if (role === 'developer') {
      await admin
        .from('profiles')
        .update({ role: 'developer', updated_at: new Date().toISOString() })
        .eq('id', data.user.id)
    }
    // Sync name/email from OAuth metadata (Google sends full_name, not first_name/last_name)
    const meta = data.user.user_metadata
    if (meta && (meta.full_name ?? meta.name ?? meta.email)) {
      await db.profiles.syncFromAuthMetadata(data.user.id, meta as Record<string, unknown>)
    }
  }

  const safeNext = next.startsWith('/') ? next : '/'
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const forwardedHost = request.headers.get('x-forwarded-host')

  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${safeNext}`)
  }
  if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${safeNext}`)
  }
  return NextResponse.redirect(`${origin}${safeNext}`)
}
