'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { approveSubmission, rejectSubmission } from './actions'
import { Flag, AlertCircle, X, Check, AlertOctagon, Sparkles, Loader2 } from 'lucide-react'
import { VideoPlayer } from '@/components/ui/VideoPlayer'

const statusColors: Record<string, string> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
}

const REJECT_REASONS = [
  'Did not follow instructions',
  'Fake/Wrong App',
  'No Audio / Broken Video',
  'Abusive/Spam',
  'Other'
]

const MOCK_MINI_FUNNEL = [
  { step: 'Créer un compte', status: 'completed' as const, timestamp: '01:10' },
  { step: 'Ajouter au panier', status: 'completed' as const, timestamp: '03:45' },
  { step: 'Utiliser le code promo', status: 'abandoned' as const },
]

interface InsightFinding {
  dimension: string
  dev_focus: string
  severity: string
  timestamp_sec: number
  title: string
  problem: string
  impact: string
  cause: string
  recommendation: string
}

function InsightCard({
  finding,
  formatTimestamp,
  variant,
}: {
  finding: InsightFinding
  formatTimestamp: (sec: number) => string
  variant: 'critical' | 'high' | 'medium' | 'low'
}) {
  const [expanded, setExpanded] = useState(false)
  const colors = {
    critical: 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400',
    high: 'border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 text-orange-400',
    medium: 'border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-400',
    low: 'border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400',
  }
  const ts = formatTimestamp(finding.timestamp_sec)
  return (
    <li
      className={`p-3 rounded-lg border text-sm text-gray-300 cursor-pointer transition-colors ${colors[variant]}`}
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono shrink-0">[{ts}]</span>
        <span className="font-medium">{finding.title || finding.problem}</span>
      </div>
      {finding.dimension && (
        <p className="text-xs text-gray-500 mt-1">{finding.dimension}</p>
      )}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs">
          <div>
            <span className="text-gray-500">Problem:</span> {finding.problem}
          </div>
          {finding.impact && (
            <div>
              <span className="text-gray-500">Impact:</span> {finding.impact}
            </div>
          )}
          {finding.cause && (
            <div>
              <span className="text-gray-500">Cause:</span> {finding.cause}
            </div>
          )}
          {finding.recommendation && (
            <div>
              <span className="text-gray-500">Recommendation:</span> {finding.recommendation}
            </div>
          )}
        </div>
      )}
    </li>
  )
}

function StarRating({ value, max = 5, onChange }: { value: number; max?: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i + 1)}
          className={`transition text-2xl ${i < value ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-500/70'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

interface AIAnalysis {
  relevanceScore: number
  requirementsMet: string[]
  requirementsMissed: string[]
  effortScore: number
  qualityScore: number
  issues: string[]
  summary: string
  isValid: boolean
}

interface Submission {
  id: string
  testerName: string
  submittedAt: string
  duration: number
  rating: number
  notes: string
  status: 'pending' | 'approved' | 'rejected'
  videoUrl: string
  aiAnalysis?: AIAnalysis | null
  insights?: {
    findings: InsightFinding[]
    analyzedAt: string
  } | null
}

interface Task {
  id: string
  title: string
  appUrl: string
  budget: number
  status: string
  steps?: string[]
}

export function TaskReviewPanel({
  task,
  activeSubmission,
  otherSubmissions,
}: {
  task: Task
  activeSubmission: Submission
  otherSubmissions: Submission[]
}) {
  const router = useRouter()
  const allSubmissions = [activeSubmission, ...otherSubmissions]
  const [selectedSubmission, setSelectedSubmission] = useState(activeSubmission)
  const [submissionsWithInsights, setSubmissionsWithInsights] = useState<Map<string, Submission>>(
    () => new Map(allSubmissions.map((s) => [s.id, s]))
  )
  const [recentAction, setRecentAction] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Modals state
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [approveRating, setApproveRating] = useState(selectedSubmission.rating || 5)
  
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0])
  const [rejectFeedback, setRejectFeedback] = useState('')

  const handleApprove = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await approveSubmission({
        submissionId: selectedSubmission.id,
        taskId: task.id,
        developerRating: approveRating,
      })
      setRecentAction('approved')
      setShowApproveModal(false)
      setTimeout(() => setRecentAction(null), 2000)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const finalFeedback = `${rejectReason}${rejectFeedback ? ': ' + rejectFeedback : ''}`
      await rejectSubmission({
        submissionId: selectedSubmission.id,
        taskId: task.id,
        feedback: finalFeedback.trim() || undefined,
      })
      setRecentAction('rejected')
      setShowRejectModal(false)
      setRejectFeedback('')
      setTimeout(() => setRecentAction(null), 2000)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setApproveRating(selectedSubmission.rating || 5)
    setShowApproveModal(false)
    setShowRejectModal(false)
  }, [selectedSubmission.id])

  useEffect(() => {
    const next = [activeSubmission, ...otherSubmissions]
    setSubmissionsWithInsights((prev) => {
      const m = new Map(prev)
      for (const s of next) m.set(s.id, s)
      return m
    })
  }, [activeSubmission, otherSubmissions])

  const handleGenerateInsights = async () => {
    if (!selectedSubmission.videoUrl) return
    setError(null)
    setIsGeneratingInsights(true)
    try {
      const res = await fetch(`/api/submissions/${selectedSubmission.id}/insights`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate insights')
      }
      const { findings, analyzedAt } = await res.json()
      const updated: Submission = {
        ...selectedSubmission,
        insights: { findings, analyzedAt },
      }
      setSubmissionsWithInsights((prev) => new Map(prev).set(selectedSubmission.id, updated))
      setSelectedSubmission(updated)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights')
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  const formatDuration = (secs: number) => {
    if (secs <= 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const ai = selectedSubmission.aiAnalysis
  const insights = selectedSubmission.insights

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const v = new URL(url).searchParams.get('v')
        return v ? `https://www.youtube.com/embed/${v}` : null
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0]
        return id ? `https://www.youtube.com/embed/${id}` : null
      }
    } catch {
      return null
    }
    return null
  }

  const videoEmbedUrl = selectedSubmission.videoUrl ? getYouTubeEmbedUrl(selectedSubmission.videoUrl) : null
  const isYouTube = !!videoEmbedUrl

  const formatTimestamp = (sec: number) => {
    if (sec <= 0) return '--:--'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const findingsBySeverity = insights?.findings
    ? {
        critical: insights.findings.filter((f) => f.severity === 'critical'),
        high: insights.findings.filter((f) => f.severity === 'high'),
        medium: insights.findings.filter((f) => f.severity === 'medium'),
        low: insights.findings.filter((f) => f.severity === 'low'),
      }
    : null

  const hasFindings = findingsBySeverity
    ? findingsBySeverity.critical.length +
        findingsBySeverity.high.length +
        findingsBySeverity.medium.length +
        findingsBySeverity.low.length >
      0
    : false

  // Mini-funnel: task.steps with mock status/timestamp, or full mock
  const funnelSteps =
    task.steps?.length
      ? task.steps.map((step, i) => {
          const mock = MOCK_MINI_FUNNEL[i]
          const completedCount = ai?.requirementsMet.length ?? 0
          const isCompleted = i < completedCount
          return {
            step,
            status: (isCompleted ? 'completed' : (mock?.status ?? 'abandoned')) as 'completed' | 'abandoned',
            timestamp: isCompleted ? (mock?.timestamp ?? '--:--') : undefined,
          }
        })
      : MOCK_MINI_FUNNEL

  return (
    <div className="space-y-8">
      {/* 1. Top Action Bar — full width: tester + metrics + actions */}
      <Card variant="glass" className="border-white/10 bg-[#1a1a1a]/80 backdrop-blur rounded-2xl p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg text-white">{selectedSubmission.testerName}</h3>
              <button className="text-gray-500 hover:text-red-400 transition-colors" title="Report abusive behavior">
                <Flag className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Submitted {selectedSubmission.submittedAt} • {formatDuration(selectedSubmission.duration)}
            </p>
            <Badge variant={statusColors[selectedSubmission.status] as 'warning' | 'success' | 'error' || 'default'}>
              {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}
            </Badge>
          </div>

          {ai && (
            <div className="flex flex-nowrap items-center gap-2 shrink-0">
              <span className="text-xs text-gray-500 uppercase tracking-wider whitespace-nowrap">Scores</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-gray-300 text-sm font-normal whitespace-nowrap">
                <span className="text-gray-500">Rel.</span> <strong className="text-white">{ai.relevanceScore}%</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-gray-300 text-sm font-normal whitespace-nowrap">
                <span className="text-gray-500">Eff.</span> <strong className="text-white">{ai.effortScore}%</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-gray-300 text-sm font-normal whitespace-nowrap">
                <span className="text-gray-500">Qual.</span> <strong className="text-white">{ai.qualityScore}%</strong>
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 shrink-0">
            {selectedSubmission.status === 'pending' ? (
              <>
                {error && (
                  <p className="text-sm text-red-400 flex items-center gap-2 mr-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </p>
                )}
                <Button
                  variant="danger"
                  className="bg-transparent hover:bg-red-500/10 text-red-400 border border-red-500/30 transition-all"
                  onClick={() => setShowRejectModal(true)}
                >
                  <X className="w-4 h-4 mr-2" /> Reject
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all"
                  onClick={() => setShowApproveModal(true)}
                >
                  <Check className="w-4 h-4 mr-2" /> Approve & Pay
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-end gap-1">
                {selectedSubmission.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Rated:</span>
                    <StarRating value={selectedSubmission.rating} />
                  </div>
                )}
                {recentAction && (
                  <p className={`text-sm font-medium ${recentAction === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                    Submission {recentAction}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Video — between top bar and Findings */}
      {selectedSubmission.videoUrl ? (
        isYouTube ? (
          <Card variant="glass" className="border-white/5 bg-[#1a1a1a]/80 backdrop-blur rounded-2xl overflow-hidden p-0">
            <div className="relative aspect-video bg-[#0a0a0a]">
              <iframe
                src={videoEmbedUrl!}
                title="Submitted video"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Card>
        ) : (
          <VideoPlayer
            src={selectedSubmission.videoUrl}
            duration={selectedSubmission.duration}
          />
        )
      ) : (
        <Card variant="glass" className="border-white/5 bg-[#1a1a1a]/80 backdrop-blur rounded-2xl p-8">
          <div className="aspect-video bg-[#0a0a0a] rounded-lg flex items-center justify-center text-gray-500 text-sm">
            No video URL available.
          </div>
        </Card>
      )}

      {/* Main: Findings + Mini-Funnel (full width) */}
      <div className="space-y-6">
          {/* Bloc 2: Findings Matrix (RITE structure from insights analysis) */}
          <Card variant="glass" className="border-white/5 bg-[#1a1a1a]/80 backdrop-blur rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-xs text-gray-400 uppercase tracking-wider">Findings priorisés</h4>
              {!insights && selectedSubmission.videoUrl && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={handleGenerateInsights}
                  disabled={isGeneratingInsights}
                >
                  {isGeneratingInsights ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Generate insights
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {hasFindings && findingsBySeverity ? (
                <>
                  {findingsBySeverity.critical.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-red-400 uppercase mb-2">Critical (Bugs & bloquants)</p>
                      <ul className="space-y-3">
                        {findingsBySeverity.critical.map((f, i) => (
                          <InsightCard key={i} finding={f} formatTimestamp={formatTimestamp} variant="critical" />
                        ))}
                      </ul>
                    </div>
                  )}
                  {findingsBySeverity.high.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-orange-400 uppercase mb-2">High (UX Friction & confusion)</p>
                      <ul className="space-y-3">
                        {findingsBySeverity.high.map((f, i) => (
                          <InsightCard key={i} finding={f} formatTimestamp={formatTimestamp} variant="high" />
                        ))}
                      </ul>
                    </div>
                  )}
                  {findingsBySeverity.medium.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-yellow-400 uppercase mb-2">Medium (Inefficiency)</p>
                      <ul className="space-y-3">
                        {findingsBySeverity.medium.map((f, i) => (
                          <InsightCard key={i} finding={f} formatTimestamp={formatTimestamp} variant="medium" />
                        ))}
                      </ul>
                    </div>
                  )}
                  {findingsBySeverity.low.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-blue-400 uppercase mb-2">Low (Suggestions)</p>
                      <ul className="space-y-3">
                        {findingsBySeverity.low.map((f, i) => (
                          <InsightCard key={i} finding={f} formatTimestamp={formatTimestamp} variant="low" />
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : insights && !hasFindings ? (
                <p className="text-sm text-gray-500 text-center py-4">No issues detected in this session.</p>
              ) : !insights ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Click &quot;Generate insights&quot; to analyze this video for product and UX findings.
                </p>
              ) : null}
              {error && (
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </p>
              )}
            </div>
          </Card>

          {/* Bloc 4: Mini-Funnel (Task Breakdown) */}
          <Card variant="glass" className="border-white/5 bg-[#1a1a1a]/80 backdrop-blur rounded-2xl p-6">
            <h4 className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-4">Mini-Funnel (étapes)</h4>
            <ul className="space-y-3">
              {funnelSteps.map((item, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{item.step}</span>
                  {item.status === 'completed' ? (
                    <span className="text-green-400">✅ [{(item as { step: string; status: 'completed'; timestamp?: string }).timestamp ?? '--:--'}]</span>
                  ) : (
                    <span className="text-red-400">❌ Abandonné</span>
                  )}
                </li>
              ))}
            </ul>
          </Card>
      </div>

      {/* Other Submissions Navigation */}
      {otherSubmissions.length > 0 && (
        <div className="mt-8 pt-8 border-t border-white/10">
          <h3 className="font-semibold mb-4 text-lg text-gray-300">Other Submissions ({otherSubmissions.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherSubmissions.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubmission(submissionsWithInsights.get(sub.id) ?? sub)}
                className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                  selectedSubmission.id === sub.id
                    ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium text-white truncate mr-2">{sub.testerName}</span>
                  <Badge variant={statusColors[sub.status] as 'warning' | 'success' | 'error' || 'default'}>
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center w-full text-xs text-gray-500">
                  <span>{sub.submittedAt}</span>
                  <span>{formatDuration(sub.duration)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quality Control: Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 border-white/10 bg-[#111] shadow-2xl relative">
            <button onClick={() => setShowApproveModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2">Approve & Release Funds</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will release <strong className="text-green-400">${task.budget}</strong> to {selectedSubmission.testerName}. This action cannot be undone.
            </p>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-3">Rate tester performance</label>
              <div className="flex justify-center p-4 bg-black/50 rounded-xl border border-white/5">
                <StarRating value={approveRating} onChange={setApproveRating} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 bg-white/5 border-white/10" onClick={() => setShowApproveModal(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20" onClick={handleApprove} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Confirm Approval'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Quality Control: Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 border-red-500/20 bg-[#111] shadow-2xl relative">
            <button onClick={() => setShowRejectModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 text-red-400 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5" /> Reject Submission
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              The tester will not be paid. Please select a reason to help us maintain platform quality.
            </p>
            
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reason for rejection <span className="text-red-500">*</span></label>
                <select 
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all appearance-none"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                >
                  {REJECT_REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Additional notes (optional)</label>
                <textarea
                  value={rejectFeedback}
                  onChange={(e) => setRejectFeedback(e.target.value)}
                  placeholder="Explain what went wrong to help the tester improve..."
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 min-h-[100px] resize-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 bg-white/5 border-white/10" onClick={() => setShowRejectModal(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1 bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20" onClick={handleReject} disabled={isLoading}>
                {isLoading ? 'Rejecting...' : 'Confirm Reject'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
