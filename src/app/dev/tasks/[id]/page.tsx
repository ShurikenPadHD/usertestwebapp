import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { formatTimeAgo, taskStatusLabel } from '@/lib/utils/format'
import { TaskReviewPanel } from './TaskReviewPanel'

export default async function DevTaskDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dev/signin')

  let task: Awaited<ReturnType<typeof db.tasks.findById>>
  try {
    task = await db.tasks.findById(params.id)
  } catch {
    notFound()
  }
  if (task.developer_id !== user.id) notFound()

  const submissions = await db.submissions.findByTask(params.id)
  const insightsList = await db.submissionInsights.findBySubmissionIds(
    submissions.map((s) => s.id)
  )
  const insightsBySubmission = Object.fromEntries(
    insightsList.map((i) => [i.submission_id, i])
  )

  const testerIds = Array.from(new Set(submissions.map((s) => s.tester_id)))
  const profiles = await db.profiles.findByIds(testerIds)
  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]))

  const mappedSubmissions = submissions.map((s) => {
    const p = profileMap[s.tester_id]
    const name = p
      ? [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || 'Tester'
      : 'Tester'
    const insights = insightsBySubmission[s.id]
    return {
      id: s.id,
      testerName: name,
      submittedAt: formatTimeAgo(s.submitted_at),
      duration: s.video_duration_seconds ?? 0,
      rating: s.developer_rating ?? 0,
      notes: s.notes ?? '',
      status: s.status as 'pending' | 'approved' | 'rejected',
      videoUrl: s.video_url ?? '',
      aiAnalysis: s.ai_analysis ?? null,
      insights: insights
        ? {
            findings: insights.findings as Array<{
              dimension: string
              dev_focus: string
              severity: string
              timestamp_sec: number
              title: string
              problem: string
              impact: string
              cause: string
              recommendation: string
            }>,
            analyzedAt: insights.analyzed_at,
          }
        : null,
    }
  })

  const activeSubmission = mappedSubmissions.find((s) => s.status === 'pending' && s.videoUrl)
    ?? mappedSubmissions[0]
  const otherSubmissions = mappedSubmissions.filter((s) => s.id !== activeSubmission?.id) ?? []

  const taskDisplay = {
    id: task.id,
    title: task.title || task.app_url || 'Untitled Task',
    appUrl: task.app_url,
    budget: Number(task.budget),
    status: taskStatusLabel(task.status),
    steps: task.steps || [],
  }

  if (submissions.length === 0) {
    return (
      <div className="flex-1 p-6 pl-0 max-w-6xl">
        <div className="mb-6">
          <Link href="/dev" className="text-gray-500 hover:text-white text-sm inline-flex items-center gap-2 transition-colors">
            <span>←</span> Back to Dashboard
          </Link>
          <div className="flex justify-between items-start mt-4">
            <h1 className="text-2xl font-bold text-white">{taskDisplay.title}</h1>
            <span className="text-xl font-semibold text-green-400">${taskDisplay.budget}</span>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a]/80 backdrop-blur-xl p-12 text-center">
          <p className="text-gray-400 text-lg">No submissions yet for this task.</p>
          <p className="text-gray-500 text-sm mt-2">Testers will appear here once they complete and submit their recordings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 pl-0 max-w-6xl">
      <div className="mb-6">
        <Link href="/dev" className="text-gray-500 hover:text-white text-sm inline-flex items-center gap-2 transition-colors">
          <span>←</span> Back to Dashboard
        </Link>
        <div className="flex justify-between items-start mt-2">
          <h1 className="text-2xl font-bold text-white">{taskDisplay.title}</h1>
          <span className="text-xl font-semibold text-green-400">${taskDisplay.budget}</span>
        </div>
      </div>

      <TaskReviewPanel
        task={taskDisplay}
        activeSubmission={activeSubmission}
        otherSubmissions={otherSubmissions}
      />
    </div>
  )
}
