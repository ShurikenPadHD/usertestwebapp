import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatTimeAgo, taskStatusLabel } from '@/lib/utils/format'

function statusVariant(status: string) {
  switch (status) {
    case 'posted': return 'info'
    case 'claimed':
    case 'submitted': return 'warning'
    case 'completed': return 'success'
    case 'draft': return 'default'
    default: return 'default'
  }
}

export default async function DevDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dev/signin')

  const tasks = await db.tasks.findByDeveloper(user.id)

  // Metrics and Recent Tasks share the same data source; counts are derived from tasks
  const posted = tasks.filter((t) => t.status === 'posted').length
  const inReview = tasks.filter((t) => t.status === 'claimed' || t.status === 'submitted').length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const drafts = tasks.filter((t) => t.status === 'draft').length

  const recentTasks = tasks.slice(0, 5)

  return (
    <div className="flex-1 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-gray-400">Manage your user testing tasks</p>
      </div>

      <div className={`grid gap-4 mb-8 ${drafts > 0 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-3'}`}>
        <Card variant="glass">
          <p className="text-sm text-gray-400">Posted</p>
          <p className="text-3xl font-semibold mt-1">{posted}</p>
        </Card>
        <Card variant="glass">
          <p className="text-sm text-gray-400">In Review</p>
          <p className="text-3xl font-semibold mt-1">{inReview}</p>
        </Card>
        <Card variant="glass">
          <p className="text-sm text-gray-400">Completed</p>
          <p className="text-3xl font-semibold mt-1">{completed}</p>
        </Card>
        {drafts > 0 && (
          <Card variant="glass">
            <p className="text-sm text-gray-400">Drafts</p>
            <p className="text-3xl font-semibold mt-1">{drafts}</p>
          </Card>
        )}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Tasks</h2>
          <Link href="/dev/tasks/new">
            <Button>+ New Task</Button>
          </Link>
        </div>

        <div className="flex flex-col gap-6" data-task-list-spacing>
          {recentTasks.length === 0 ? (
            <Card variant="glass" className="p-8 text-center border-white/10">
              <p className="text-gray-400 mb-4">You haven&apos;t created any tasks yet.</p>
              <Link href="/dev/tasks/new">
                <Button>+ Create your first task</Button>
              </Link>
            </Card>
          ) : (
            recentTasks.map((task) => (
              <Link key={task.id} href={`/dev/tasks/${task.id}`} className="block">
                <Card variant="glass" className="hover:border-white/10 transition cursor-pointer !p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{task.title || task.app_url || 'Untitled Task'}</h3>
                      <p className="text-sm text-gray-400">{task.app_url}</p>
                    </div>
                    <Badge variant={statusVariant(task.status)}>
                      {taskStatusLabel(task.status)}
                    </Badge>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-green-400">${Number(task.budget)}</span>
                    <span className="text-gray-500 text-sm">{formatTimeAgo(task.created_at)}</span>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
