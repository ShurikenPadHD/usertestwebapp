import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, ExternalLink, DollarSign, CheckCircle2, Play } from 'lucide-react'
import { difficultyDisplayLabel } from '@/lib/utils/format'

export default async function TaskBriefPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/tester/signin')

  let task: Awaited<ReturnType<typeof db.tasks.findById>>
  try {
    task = await db.tasks.findById(params.id)
  } catch {
    notFound()
  }

  if (task.status !== 'posted' && task.assigned_tester_id !== user.id) {
    notFound()
  }

  const mySubmissions = await db.submissions.findByTask(params.id)
  const myRejected = mySubmissions.filter((s) => s.tester_id === user.id && s.status === 'rejected')
  const latestRejectedFeedback = myRejected.length > 0
    ? myRejected.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0]?.developer_feedback
    : null

  const title = task.title || task.app_url || 'Untitled Task'
  const budget = Number(task.budget)
  const duration = task.estimated_duration_minutes ?? 5
  const difficulty = difficultyDisplayLabel(task.difficulty)
  // Company & Product Info (real data from task; no mock fallback)
  const companyName = task.company_name ?? null
  const productName = task.product_name ?? null
  const productTagline = task.product_tagline ?? null
  const companyWebsite = task.company_website ?? null
  const founderName = task.founder_name ?? null
  const companyDescription = task.company_description ?? null

  // Legacy task info (kept for reference if no company info)
  const about = task.about || task.instructions || 'No description provided.'
  const requirements = task.requirements?.length ? task.requirements : [
    'Record your screen with audio',
    'Voice narration required',
    'Show your actual screen (no fake apps)',
  ]
  const steps = task.steps?.length ? task.steps : (task.instructions ? task.instructions.split('\n').filter(Boolean) : ['No steps defined.'])

  const appUrlFormatted = task.app_url.startsWith('http') ? task.app_url : `https://${task.app_url}`

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
      {/* Back Button */}
      <Link href="/tester/available" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Available Tests
      </Link>

      {/* Task Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant="success">{difficulty}</Badge>
          <Badge variant="default">{duration} minutes</Badge>
          <span className="flex items-center gap-1 text-green-400 font-semibold">
            <DollarSign className="w-4 h-4" /> {budget}
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <a
          href={appUrlFormatted}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          {task.app_url} <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Company & Product Info - NEW */}
      {(companyName || productName || companyWebsite || founderName || companyDescription) && (
        <Card variant="glass" className="p-6 mb-6 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-start gap-4">
            {/* Company Avatar/Logo Placeholder */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {(companyName || productName || '🏢').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              {companyName && (
                <p className="text-sm text-gray-400 mb-0.5">🏢 {companyName}</p>
              )}
              {productName && (
                <h2 className="text-xl font-bold mb-1">{productName}</h2>
              )}
              {productTagline && (
                <p className="text-gray-400 text-sm mb-3">"{productTagline}"</p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {founderName && (
                  <span className="text-gray-500">👋 Founded by {founderName}</span>
                )}
                {companyWebsite && (
                  <a 
                    href={companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    🌐 {companyWebsite.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
              {companyDescription && (
                <p className="text-gray-400 text-sm mt-3 leading-relaxed">{companyDescription}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Requirements */}
      <Card variant="glass" className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Requirements</h2>
        <ul className="space-y-3">
          {requirements.map((req: string, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
              <span className="text-gray-300">{req}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* What to Test */}
      <Card variant="glass" className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">What to Test</h2>
        <ol className="space-y-3">
          {steps.map((step: string, i: number) => (
            <li key={i} className="flex gap-3 text-gray-300">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-medium shrink-0 text-sm">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* Rejected feedback + Resubmit CTA (only when task still open) */}
      {latestRejectedFeedback && task.status !== 'completed' && (
        <Card variant="glass" className="p-6 mb-6 border-red-500/20 bg-red-500/5">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Previous submission rejected</h2>
          <p className="text-gray-300 mb-4">{latestRejectedFeedback}</p>
          <Link href={`/tester/tasks/${params.id}/submit`}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Play className="w-4 h-4 mr-2" /> Resubmit Your Test Video
            </Button>
          </Link>
        </Card>
      )}

      {/* Earnings Info */}
      <Card variant="glass" className="p-6 mb-6 bg-gradient-to-r from-green-900/10 to-blue-900/10 border-green-500/20">
        <div className="flex items-center justify-between gap-4">
          <p className="text-2xl font-bold text-green-400">${budget}</p>
          <p className="text-sm text-gray-500 text-right">Payout after approval (hold: 3 days)</p>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href={appUrlFormatted}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button variant="secondary" className="w-full border-white/10">
            <ExternalLink className="w-4 h-4 mr-2" /> Open App in New Tab
          </Button>
        </a>
        <Link
          href={`/tester/tasks/${params.id}/submit`}
          className="flex-1 inline-flex items-center justify-center w-full font-medium rounded-lg px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] focus:ring-blue-500"
        >
          <Play className="w-4 h-4 mr-2" /> Submit Your Test Video
        </Link>
      </div>
    </div>
  )
}
