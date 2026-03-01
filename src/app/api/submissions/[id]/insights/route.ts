import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { analyzeVideoInsights } from '@/lib/ai/video-insights-analysis'
import type { DeveloperTestContext } from '@/lib/ai/video-insights-analysis'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submissionId = params.id
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: sub } = await supabase
      .from('submissions')
      .select('id, video_url, task_id')
      .eq('id', submissionId)
      .single()

    if (!sub?.video_url) {
      return NextResponse.json(
        { error: 'Submission has no video URL' },
        { status: 400 }
      )
    }

    const task = await db.tasks.findById(sub.task_id)
    if (task.developer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const developerContext: DeveloperTestContext = {
      testGoal: task.test_goal ?? task.about ?? undefined,
      focusAreas:
        Array.isArray(task.focus_areas) && task.focus_areas.length > 0
          ? task.focus_areas
          : task.requirements ?? undefined,
      successDefinition: task.success_definition ?? undefined,
      persona: task.target_persona ?? undefined,
      keyFeature: task.key_feature ?? undefined,
    }

    const result = await analyzeVideoInsights({
      videoUrl: sub.video_url,
      developerContext,
    })

    await db.submissionInsights.upsert(
      submissionId,
      result.findings,
      result.provider
    )

    return NextResponse.json({
      findings: result.findings,
      analyzedAt: result.analyzedAt,
      provider: result.provider,
    })
  } catch (error) {
    console.error('Insights analysis error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Insights analysis failed',
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submissionId = params.id
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const insights = await db.submissionInsights.findBySubmission(submissionId)
    if (!insights) {
      return NextResponse.json({ findings: null }, { status: 200 })
    }

    const { data: sub } = await supabase
      .from('submissions')
      .select('task_id')
      .eq('id', submissionId)
      .single()

    if (!sub) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const task = await db.tasks.findById(sub.task_id)
    if (task.developer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      findings: insights.findings,
      analyzedAt: insights.analyzed_at,
      provider: insights.provider,
    })
  } catch (error) {
    console.error('Insights fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch' },
      { status: 500 }
    )
  }
}
