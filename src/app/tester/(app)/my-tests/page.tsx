import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MyTestsClient } from './MyTestsClient'

export default async function MyTestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/tester/signin')

  const submissions = await db.submissions.findByTester(user.id)
  const taskIds = Array.from(new Set(submissions.map((s) => s.task_id)))
  const tasks = await Promise.all(taskIds.map((id) => db.tasks.findById(id).catch(() => null)))
  const taskMap = Object.fromEntries(
    tasks.filter(Boolean).map((t) => [t!.id, t])
  ) as Record<string, { id: string; title?: string; app_url?: string; budget?: number; status?: string }>

  const submitted = submissions.filter((s) => s.status === 'pending').length
  const approved = submissions.filter((s) => s.status === 'approved').length
  const rejected = submissions.filter((s) => s.status === 'rejected').length

  const recentSubmissions = submissions.slice(0, 5)
  const isDebug = process.env.NODE_ENV === 'development'

  return (
    <div className="flex-1 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">My Tests</h1>
        <p className="text-gray-400">Manage your claimed and submitted tests</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card variant="glass">
          <p className="text-sm text-gray-400">Submitted</p>
          <p className="text-3xl font-semibold mt-1">{submitted}</p>
        </Card>
        <Card variant="glass">
          <p className="text-sm text-gray-400">Approved</p>
          <p className="text-3xl font-semibold mt-1">{approved}</p>
        </Card>
        <Card variant="glass">
          <p className="text-sm text-gray-400">Rejected</p>
          <p className="text-3xl font-semibold mt-1">{rejected}</p>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Tasks</h2>
          <Link href="/tester/available">
            <Button>Browse Available Tests</Button>
          </Link>
        </div>

        {recentSubmissions.length === 0 ? (
          <Card variant="glass" className="p-8 text-center border-white/10">
            <p className="text-gray-400 mb-4">You haven&apos;t submitted any tests yet.</p>
            <Link href="/tester/available">
              <Button>Browse Available Tests</Button>
            </Link>
          </Card>
        ) : (
          <MyTestsClient
            submissions={recentSubmissions}
            taskMap={taskMap}
            isDebug={isDebug}
          />
        )}
      </div>
    </div>
  )
}
