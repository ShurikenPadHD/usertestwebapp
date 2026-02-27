'use server'

import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export async function createTask(data: {
  appUrl: string
  instructions?: string
  budget: number
  taskTypes?: string[]
  title?: string
  maxTesters?: number
  estimatedDurationMinutes?: number
  difficulty?: string
  platform?: string
  about?: string
  requirements?: string[]
  steps?: string[]
  platformFeePercent?: number
  // Company & Product Info
  companyName?: string
  productName?: string
  productTagline?: string
  companyWebsite?: string
  founderName?: string
  companyDescription?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dev/signin')

  const hasSteps = data.steps && data.steps.length > 0
  const hasInstructions = data.instructions && data.instructions.length >= 50
  if (!hasSteps && !hasInstructions) {
    throw new Error('Add at least one step in "What to Test" or provide detailed instructions.')
  }

  const maxTesters = data.maxTesters ?? 1
  const reserveCents = Math.round(data.budget * maxTesters * 100)
  const taskId = randomUUID()

  await db.wallets.reserve(user.id, reserveCents, { task_id: taskId, task_title: data.title ?? 'Test' })

  await db.tasks.create({
    id: taskId,
    developerId: user.id,
    appUrl: data.appUrl,
    instructions: data.instructions,
    budget: data.budget,
    taskTypes: data.taskTypes,
    title: data.title,
    maxTesters,
    estimatedDurationMinutes: data.estimatedDurationMinutes,
    difficulty: data.difficulty,
    platform: data.platform,
    about: data.about,
    requirements: data.requirements,
    steps: data.steps,
    // Company & Product Info
    companyName: data.companyName || null,
    productName: data.productName || null,
    productTagline: data.productTagline || null,
    companyWebsite: data.companyWebsite || null,
    founderName: data.founderName || null,
    companyDescription: data.companyDescription || null,
  })
}
