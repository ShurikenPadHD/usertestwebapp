import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { formatTimeAgo, platformDisplayLabel, difficultyDisplayLabel } from '@/lib/utils/format'
import type { TestListing } from '@/components/test/TestGrid'
import { AvailableTestsClient } from './AvailableTestsClient'

export default async function AvailableTestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/tester/signin')

  const tasks = await db.tasks.findPosted()

  const developerIds = Array.from(new Set(tasks.map((t) => t.developer_id)))
  const profiles = await db.profiles.findByIds(developerIds)
  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]))

  const tests: TestListing[] = tasks.map((task) => {
    const dev = profileMap[task.developer_id]
    const developerName = dev
      ? [dev.first_name, dev.last_name].filter(Boolean).join(' ') || dev.email || 'Developer'
      : 'Developer'

    return {
      id: task.id,
      title: task.title || task.app_url || 'Untitled Task',
      appUrl: task.app_url,
      budget: Number(task.budget),
      duration: task.estimated_duration_minutes ?? 5,
      difficulty: difficultyDisplayLabel(task.difficulty),
      postedAt: formatTimeAgo(task.created_at),
      platform: platformDisplayLabel(task.platform),
      platformRaw: task.platform ?? 'web',
      taskType: (task.task_types?.[0] ?? task.task_type) ?? undefined,
      taskTypes: task.task_types ?? (task.task_type ? [task.task_type] : []),
      createdAt: task.created_at,
      developer: developerName,
    }
  })

  return <AvailableTestsClient tests={tests} />
}
