'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { approveSubmission, rejectSubmission } from './actions'
import { CheckCircle2, ShieldAlert, ShieldCheck, Flag, Brain, AlertCircle, X, Check, PlayCircle, AlertOctagon, AlertTriangle } from 'lucide-react'

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
  const [selectedSubmission, setSelectedSubmission] = useState(activeSubmission)
  const [recentAction, setRecentAction] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
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

  const formatDuration = (secs: number) => {
    if (secs <= 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const ai = selectedSubmission.aiAnalysis

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Left Side: Video Player & Raw Notes (60%) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black">
            <VideoPlayer
              src={selectedSubmission.videoUrl}
              duration={selectedSubmission.duration}
            />
          </div>

          {/* Raw Tester Notes */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Tester Notes</h3>
            {selectedSubmission.notes ? (
              <Card variant="glass" className="border-white/10 p-5 bg-[#0a0a0a]">
                <p className="text-gray-300 italic leading-relaxed">&quot;{selectedSubmission.notes}&quot;</p>
              </Card>
            ) : (
              <p className="text-gray-500 italic text-sm">No notes provided by the tester.</p>
            )}
          </div>
        </div>

        {/* Right Side: Insight Command Center (40%) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card variant="glass" className="flex flex-col h-[700px] border-white/10 shadow-2xl">
            
            {/* Header: Tester Profile & Status */}
            <div className="p-5 border-b border-white/5 bg-white/[0.02]">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg">{selectedSubmission.testerName}</h3>
                    <button className="text-gray-500 hover:text-red-400 transition-colors" title="Report abusive behavior">
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Submitted {selectedSubmission.submittedAt} • {formatDuration(selectedSubmission.duration)}
                  </p>
                </div>
                <Badge variant={statusColors[selectedSubmission.status] as 'warning' | 'success' | 'error' || 'default'}>
                  {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}
                </Badge>
              </div>
            </div>

            {/* AI Insight Dashboard (Scrollable) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {ai ? (
                <>
                  {/* Feature 4.1: AI Executive Summary (TL;DR) */}
                  <div className="p-5 border-b border-white/5">
                    <h4 className="font-semibold text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                      <Brain className="w-4 h-4 text-purple-400" /> AI Executive Summary
                    </h4>
                    
                    <div className="text-sm text-gray-300 space-y-3 mb-4">
                      {/* TL;DR Bullets (derived from AI summary and analysis) */}
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <p>{ai.summary}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <p>Completed {ai.requirementsMet.length} of {ai.requirementsMet.length + ai.requirementsMissed.length} designated task steps.</p>
                      </div>
                      {ai.issues.length > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          <p>Encountered {ai.issues.length} critical issues/errors during the test.</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="secondary" className="bg-white/5 text-gray-300 font-normal">Relevance: <strong className="ml-1 text-white">{ai.relevanceScore}%</strong></Badge>
                      <Badge variant="secondary" className="bg-white/5 text-gray-300 font-normal">Effort: <strong className="ml-1 text-white">{ai.effortScore}%</strong></Badge>
                      <Badge variant="secondary" className="bg-white/5 text-gray-300 font-normal">Quality: <strong className="ml-1 text-white">{ai.qualityScore}%</strong></Badge>
                    </div>
                  </div>

                  {/* Feature 4.3: The Highlight Reel */}
                  <div className="p-5">
                    <h4 className="font-semibold text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                      <PlayCircle className="w-4 h-4 text-blue-400" /> Highlight Reel (Events)
                    </h4>
                    
                    <div className="space-y-3">
                      
                      {/* Critical Issues */}
                      {ai.issues.map((issue, i) => (
                        <div key={`issue-${i}`} className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 cursor-pointer transition-colors group">
                          <div className="flex items-start gap-3">
                            <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-red-400 uppercase">Critical</span>
                                <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">▶ Click to play clip</span>
                              </div>
                              <p className="text-sm text-gray-300">{issue}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* UX Friction */}
                      {ai.requirementsMissed.map((req, i) => (
                        <div key={`miss-${i}`} className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 cursor-pointer transition-colors group">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-yellow-400 uppercase">Friction / Missed</span>
                                <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">▶ Click to play clip</span>
                              </div>
                              <p className="text-sm text-gray-300">Missed step: {req}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Task Progress / Success */}
                      {ai.requirementsMet.map((req, i) => (
                        <div key={`met-${i}`} className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 cursor-pointer transition-colors group">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-green-400 uppercase">Success</span>
                                <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">▶ Click to play clip</span>
                              </div>
                              <p className="text-sm text-gray-300">Completed: {req}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Empty state if AI found literally nothing to report */}
                      {ai.issues.length === 0 && ai.requirementsMissed.length === 0 && ai.requirementsMet.length === 0 && (
                         <p className="text-sm text-gray-500 text-center py-4">No specific timeline events detected.</p>
                      )}

                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center h-full flex flex-col items-center justify-center">
                  <Brain className="w-12 h-12 text-gray-600 mb-4" />
                  <p className="text-gray-400 font-medium mb-1">AI Processing Pending</p>
                  <p className="text-sm text-gray-500">The video is being processed or AI was unavailable during submission.</p>
                </div>
              )}
            </div>

            {/* Feature 4.4: Approval/Rejection Sticky Footer */}
            {selectedSubmission.status === 'pending' ? (
              <div className="p-5 border-t border-white/10 bg-[#0f0f0f] shrink-0">
                {error && <p className="mb-3 text-sm text-red-400 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> {error}</p>}
                <div className="flex gap-3">
                  <Button 
                    variant="danger" 
                    className="flex-1 bg-transparent hover:bg-red-500/10 text-red-400 border border-red-500/30 transition-all"
                    onClick={() => setShowRejectModal(true)}
                  >
                    <X className="w-4 h-4 mr-2" /> Reject
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all"
                    onClick={() => setShowApproveModal(true)}
                  >
                    <Check className="w-4 h-4 mr-2" /> Approve & Pay
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-5 border-t border-white/10 bg-[#0f0f0f] shrink-0 text-center">
                {selectedSubmission.rating > 0 && (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-sm text-gray-400">You rated this tester:</span>
                    <StarRating value={selectedSubmission.rating} />
                  </div>
                )}
                {recentAction && (
                  <p className={`mt-2 text-sm font-medium ${recentAction === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                    Submission {recentAction}
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>
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
                onClick={() => setSelectedSubmission(sub)}
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
