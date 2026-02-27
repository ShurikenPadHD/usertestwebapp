'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { approveSubmission, rejectSubmission } from './actions'

const statusColors: Record<string, string> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
}

function StarRating({ value, max = 5, onChange }: { value: number; max?: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i + 1)}
          className={`transition ${i < value ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-500/70'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
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
}

interface Task {
  id: string
  title: string
  appUrl: string
  budget: number
  status: string
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
  const [approveRating, setApproveRating] = useState(selectedSubmission.rating || 5)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectFeedback, setRejectFeedback] = useState('')

  const handleApprove = async () => {
    if (selectedSubmission.status !== 'pending') return
    setError(null)
    setIsLoading(true)
    try {
      await approveSubmission({
        submissionId: selectedSubmission.id,
        taskId: task.id,
        developerRating: approveRating,
      })
      setRecentAction('approved')
      setTimeout(() => setRecentAction(null), 2000)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (selectedSubmission.status !== 'pending') return
    if (!showRejectForm) {
      setShowRejectForm(true)
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      await rejectSubmission({
        submissionId: selectedSubmission.id,
        taskId: task.id,
        feedback: rejectFeedback.trim() || undefined,
      })
      setRecentAction('rejected')
      setShowRejectForm(false)
      setRejectFeedback('')
      setTimeout(() => setRecentAction(null), 2000)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject')
    } finally {
      setIsLoading(false)
    }
  }

  const cancelReject = () => {
    setShowRejectForm(false)
    setRejectFeedback('')
  }

  useEffect(() => {
    setApproveRating(selectedSubmission.rating || 5)
    setShowRejectForm(false)
  }, [selectedSubmission.id])

  const formatDuration = (secs: number) => {
    if (secs <= 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Split: Video | Submission Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <VideoPlayer
            src={selectedSubmission.videoUrl}
            duration={selectedSubmission.duration}
            onApprove={handleApprove}
            onReject={handleReject}
            actionDisabled={isLoading}
          />
          {showRejectForm && selectedSubmission.status === 'pending' && (
            <Card variant="glass" className="border-red-500/20">
              <h4 className="font-medium text-red-400 mb-2">Reject submission</h4>
              <p className="text-sm text-gray-400 mb-3">Optionally add feedback for the tester.</p>
              <textarea
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                placeholder="e.g. Video quality too low, instructions not followed..."
                className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 mb-3 min-h-[80px]"
                rows={3}
              />
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={cancelReject} disabled={isLoading}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={handleReject} disabled={isLoading}>
                  Confirm Reject
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div>
          <Card variant="glass" className="h-full">
            <h3 className="font-semibold mb-4 text-lg border-b border-white/5 pb-2">
              Submission Details
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Tester</p>
                <p className="font-medium">{selectedSubmission.testerName}</p>
              </div>
              <div>
                <p className="text-gray-500">Submitted</p>
                <p className="font-medium">{selectedSubmission.submittedAt}</p>
              </div>
              <div>
                <p className="text-gray-500">Duration</p>
                <p className="font-medium">{formatDuration(selectedSubmission.duration)}</p>
              </div>
              {selectedSubmission.status === 'pending' && (
                <div>
                  <p className="text-gray-500 mb-1">Your rating (on approve)</p>
                  <StarRating value={approveRating} onChange={setApproveRating} />
                </div>
              )}
              {selectedSubmission.rating > 0 && selectedSubmission.status !== 'pending' && (
                <div>
                  <p className="text-gray-500 mb-1">Rating</p>
                  <StarRating value={selectedSubmission.rating} />
                </div>
              )}
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            {recentAction && (
              <p className="mt-4 text-sm text-green-400">
                {recentAction === 'approved' ? '✓ Approved' : '✗ Rejected'}
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Tester Notes */}
      {selectedSubmission.notes && (
        <div>
          <h3 className="font-semibold mb-2">Tester Notes</h3>
          <Card variant="glass" className="border-white/10">
            <p className="text-gray-300 italic">&quot;{selectedSubmission.notes}&quot;</p>
          </Card>
        </div>
      )}

      {/* Other Submissions */}
      {otherSubmissions.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Other Submissions ({otherSubmissions.length})</h3>
          <div className="space-y-2">
            {otherSubmissions.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubmission(sub)}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  selectedSubmission.id === sub.id
                    ? 'bg-white/5 border-blue-500/50'
                    : 'bg-[#1a1a1a]/50 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{sub.testerName}</span>
                  <Badge variant={statusColors[sub.status] as 'warning' | 'success' | 'error' || 'default'}>
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </Badge>
                </div>
                {sub.submittedAt && (
                  <p className="text-sm text-gray-500 mt-1">{sub.submittedAt}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
