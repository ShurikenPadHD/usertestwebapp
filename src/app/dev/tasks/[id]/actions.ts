'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

const PLATFORM_FEE_PERCENT = 20
const HOLD_DAYS: Record<string, number> = { new: 7, regular: 3, trusted: 0 }

/** Approve a submission. Updates submission, task, and credits tester wallet. */
export async function approveSubmission(data: {
  submissionId: string
  taskId: string
  developerRating?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dev/signin')

  const task = await db.tasks.findById(data.taskId)
  if (task.developer_id !== user.id) throw new Error('Not authorized')

  const submission = await db.submissions.findByTask(data.taskId)
  const sub = submission.find((s) => s.id === data.submissionId)
  if (!sub) throw new Error('Submission not found')

  const platformFeePercent = Number(task.platform_fee_percent) || PLATFORM_FEE_PERCENT
  const amount = Number(task.budget)
  const testerEarningsCents = Math.round(amount * (1 - platformFeePercent / 100) * 100)

  const profile = await db.profiles.findById(sub.tester_id)
  const trustLevel = (profile?.trust_level as string) ?? 'new'
  const holdDays = HOLD_DAYS[trustLevel] ?? 7
  const availableAt = new Date()
  availableAt.setDate(availableAt.getDate() + holdDays)

  await db.wallets.creditTester(sub.tester_id, testerEarningsCents, {
    task_id: data.taskId,
    submission_id: data.submissionId,
    task_title: task.title ?? 'Test',
  }, availableAt.toISOString())

  await db.submissions.updateStatus(data.submissionId, 'approved', data.developerRating ?? 5)
  await db.tasks.updateStatus(data.taskId, 'completed')
  await db.profiles.incrementCompletedAndPromoteTrust(sub.tester_id)

  return { ok: true }
}

/** Reject a submission with optional feedback. */
export async function rejectSubmission(data: {
  submissionId: string
  taskId: string
  feedback?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dev/signin')

  const task = await db.tasks.findById(data.taskId)
  if (task.developer_id !== user.id) throw new Error('Not authorized')

  const submission = await db.submissions.findByTask(data.taskId)
  const sub = submission.find((s) => s.id === data.submissionId)
  if (!sub) throw new Error('Submission not found')

  await db.submissions.updateStatus(data.submissionId, 'rejected', undefined, data.feedback)

  return { ok: true }
}
