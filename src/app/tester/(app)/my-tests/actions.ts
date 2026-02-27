'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

/** DEBUG ONLY: Cancel submission and restore task to available. */
export async function cancelSubmissionForDebug(submissionId: string, taskId: string) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Only available in development')
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/tester/signin')

  await db.submissions.cancelForDebug(submissionId, user.id, taskId)
  return { ok: true }
}
