'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

/** Submit a test. Claims the task (if unclaimed) and creates a submission record. */
export async function submitTest(data: {
  taskId: string
  videoUrl?: string
  videoDurationSeconds?: number
  notes?: string
  aiAnalysis?: {
    relevanceScore: number
    requirementsMet: string[]
    requirementsMissed: string[]
    effortScore: number
    qualityScore: number
    issues: string[]
    summary: string
    isValid: boolean
  }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/tester/signin')

  if (!data.videoUrl) {
    throw new Error('Video URL is required')
  }
  
  const videoUrl = data.videoUrl
  const videoDurationSeconds = data.videoDurationSeconds ?? 180

  // Claim task first (atomic: only if unclaimed or already assigned to this user)
  await db.tasks.updateStatusOnSubmit(data.taskId, user.id)

  const submission = await db.submissions.create({
    taskId: data.taskId,
    testerId: user.id,
    videoUrl,
    videoDurationSeconds,
    notes: data.notes,
    aiAnalysis: data.aiAnalysis ? {
      relevanceScore: data.aiAnalysis.relevanceScore,
      requirementsMet: data.aiAnalysis.requirementsMet,
      requirementsMissed: data.aiAnalysis.requirementsMissed,
      effortScore: data.aiAnalysis.effortScore,
      qualityScore: data.aiAnalysis.qualityScore,
      issues: data.aiAnalysis.issues,
      summary: data.aiAnalysis.summary,
      isValid: data.aiAnalysis.isValid,
      submittedAt: new Date().toISOString()
    } : null,
  })

  return { submissionId: submission.id }
}
