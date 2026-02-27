'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatTimeAgo } from '@/lib/utils/format'
import { cancelSubmissionForDebug } from './actions'
import { X } from 'lucide-react'

interface Submission {
  id: string
  task_id: string
  status: string
  submitted_at: string
  developer_feedback?: string | null
}

interface Task {
  id: string
  title?: string | null
  app_url?: string | null
  budget?: number
}

interface MyTestsClientProps {
  submissions: Submission[]
  taskMap: Record<string, Task>
  isDebug: boolean
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'pending': return 'SUBMITTED'
    case 'approved': return 'APPROVED'
    case 'rejected': return 'REJECTED'
    default: return status.toUpperCase()
  }
}

function getStatusVariant(status: string): 'warning' | 'default' | 'success' | 'error' {
  switch (status) {
    case 'pending': return 'warning'
    case 'approved': return 'success'
    case 'rejected': return 'error'
    default: return 'default'
  }
}

export function MyTestsClient({ submissions, taskMap, isDebug }: MyTestsClientProps) {
  const router = useRouter()
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const handleCancel = async (e: React.MouseEvent, submissionId: string, taskId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDebug) return
    setCancellingId(submissionId)
    try {
      await cancelSubmissionForDebug(submissionId, taskId)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6" data-task-list-spacing>
      {submissions.map((sub) => {
        const task = taskMap[sub.task_id]
        const taskId = sub.task_id
        const title = task?.title ?? task?.app_url ?? 'Untitled Task'
        const appUrl = task?.app_url ?? ''
        const budget = task?.budget ?? 0
        const canCancel = isDebug && sub.status === 'pending'

        return (
          <div key={sub.id} className="relative">
            <Link href={`/tester/tasks/${taskId}`} className="block">
              <Card variant="glass" className="hover:border-white/10 transition cursor-pointer !p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{String(title)}</h3>
                    <p className="text-sm text-gray-400">{String(appUrl)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(sub.status)}>
                      {getStatusLabel(sub.status)}
                    </Badge>
                    {canCancel && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="!p-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCancel(e, sub.id, taskId); }}
                        disabled={cancellingId === sub.id}
                        title="Cancel submission (debug only)"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-green-400">${Number(budget)}</span>
                  <span className="text-gray-500 text-sm">
                    {sub.status === 'pending' ? 'Awaiting review' : 'Submitted'} {formatTimeAgo(sub.submitted_at)}
                  </span>
                </div>
                {sub.status === 'rejected' && sub.developer_feedback && (
                  <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400 font-medium mb-1">Developer feedback</p>
                    <p className="text-sm text-gray-300">{sub.developer_feedback}</p>
                  </div>
                )}
              </Card>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
