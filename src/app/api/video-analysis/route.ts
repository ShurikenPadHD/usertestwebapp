import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeVideo } from '@/lib/ai/video-analysis'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { submissionId, taskTitle, taskDescription } = body

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId is required' }, { status: 400 })
    }

    // Get submission data
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .select('*, tasks(title, description)')
      .eq('id', submissionId)
      .single()

    if (subError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Check if user owns the task (developer)
    const { data: task } = await supabase
      .from('tasks')
      .select('developer_id')
      .eq('id', submission.task_id)
      .single()

    if (!task || task.developer_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized - you do not own this task' }, { status: 403 })
    }

    // Perform AI analysis
    const result = await analyzeVideo({
      videoUrl: submission.video_url,
      taskTitle: taskTitle || submission.tasks?.title,
      taskDescription: taskDescription || submission.tasks?.description,
      expectedDurationSeconds: submission.video_duration_seconds
    })

    // Store analysis result in database
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        ai_analysis: {
          isLegitimate: result.isLegitimate,
          effortScore: result.effortScore,
          qualityScore: result.qualityScore,
          issues: result.issues,
          summary: result.summary,
          analyzedAt: result.analyzedAt,
          provider: result.provider
        }
      })
      .eq('id', submissionId)

    if (updateError) {
      console.error('Failed to store analysis:', updateError)
    }

    return NextResponse.json({
      success: true,
      submissionId,
      analysis: result
    })

  } catch (error) {
    console.error('Video analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}
